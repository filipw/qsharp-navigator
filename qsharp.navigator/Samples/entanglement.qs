@EntryPoint()
import Std.Diagnostics.*;

operation Main() : (Result, Result) {
    use (control, target) = (Qubit(), Qubit());
    H(control);
    CNOT(control, target);
    
    DumpMachine();
    let resultControl = MResetZ(control);
    let resultTarget = MResetZ(target);
    return (resultControl, resultTarget);
}
