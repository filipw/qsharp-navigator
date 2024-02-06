mod tests;

uniffi::include_scaffolding!("qsharp-bridge");

use qsc::interpret::{Interpreter, self};
use thiserror::Error;
use num_bigint::BigUint;
use num_complex::Complex64;
use qsc::interpret::output::Receiver;
use qsc::interpret::output;
use qsc::{SourceMap, PackageType, RuntimeCapabilityFlags};

#[derive(Error, Debug)]
pub enum QsError {
    #[error("Error with message: `{error_text}`")]
    ErrorMessage { error_text: String }
}

impl From<Vec<interpret::Error>> for QsError {
    fn from(errors: Vec<interpret::Error>) -> Self {
        let mut error_message = String::new();

        for error in errors {
            if let Some(stack_trace) = error.stack_trace() {
                error_message.push_str(&format!("Stack trace: {}", stack_trace));
            }

            error_message.push_str(&format!(", error: {:?}", error));
        }

        QsError::ErrorMessage { error_text: error_message }
    }
}

pub fn run_qs(source: &str) -> Result<ExecutionState, QsError> {
    let source_map = SourceMap::new(vec![("temp.qs".into(), source.into())], None);
    let mut interpreter = match Interpreter::new(
        true,
        source_map,
        PackageType::Exe,
        RuntimeCapabilityFlags::all(),
    ) {
        Ok(interpreter) => interpreter,
        Err(errors) => {
            return Err(errors.into());
        }
    };

    let mut rec = ExecutionState::default();
    let result = interpreter.eval_entry(&mut rec)?;
    rec.set_result(result.to_string());
    return Ok(rec);
}

pub fn run_qs_shots(source: &str, shots: u32) -> Result<Vec<ExecutionState>, QsError> {
    let mut results: Vec<ExecutionState> = Vec::new();

    let source_map = SourceMap::new(vec![("temp.qs".into(), source.into())], None);

    let mut interpreter = match Interpreter::new(
        true,
        source_map,
        PackageType::Exe,
        RuntimeCapabilityFlags::all(),
    ) {
        Ok(interpreter) => interpreter,
        Err(errors) => {
            return Err(errors.into());
        }
    };

    for _ in 0..shots {
        let mut rec = ExecutionState::default();
        let result = interpreter.eval_entry(&mut rec)?;
        rec.set_result(result.to_string());
        results.push(rec)
    }

    return Ok(results);
}

pub fn qir(source: &str) -> Result<String, QsError> {
    //let source_map = SourceMap::new(vec![("temp.qs".into(), source.into())], None);
    let mut interpreter = match Interpreter::new(
        true,
        SourceMap::default(),
        PackageType::Lib,
        RuntimeCapabilityFlags::empty(),
    ) {
        Ok(interpreter) => interpreter,
        Err(errors) => {
            return Err(errors.into());
        }
    };

    let result = interpreter.qirgen(source)?;
    return Ok(result);
}


pub struct QubitState {
    id: String,
    amplitude_real: f64,
    amplitude_imaginary: f64,
}

pub struct ExecutionState {
    states: Vec<QubitState>,
    qubit_count: u64,
    messages: Vec<String>,
    result: Option<String>,
}

impl ExecutionState {
    fn set_result(&mut self, result: String) {
        self.result = Some(result);
    }
}

impl Default for ExecutionState {
    fn default() -> Self {
        Self {
            states: Vec::new(),
            qubit_count: 0,
            messages: Vec::new(),
            result: None,
        }
    }
}

impl Receiver for ExecutionState {
    fn state(
        &mut self,
        states: Vec<(BigUint, Complex64)>,
        qubit_count: usize,
    ) -> Result<(), output::Error> {
        self.qubit_count = qubit_count as u64;
        self.states = states.iter().map(|(qubit, amplitude)| {
            QubitState {
                id: output::format_state_id(&qubit, qubit_count),
                amplitude_real: amplitude.re,
                amplitude_imaginary: amplitude.im,
            }
        }).collect();

        Ok(())
    }

    fn message(&mut self, msg: &str) -> Result<(), output::Error> {
        self.messages.push(msg.to_string());
        Ok(())
    }
}