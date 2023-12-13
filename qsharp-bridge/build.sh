HEADERPATH="../bindings/qsharp_bridgeFFI.h"
TARGETDIR="target"
OUTDIR="../libs"
RELDIR="release"
NAME="qsharp_bridge"
STATIC_LIB_NAME="lib${NAME}.a"
NEW_HEADER_DIR="../bindings/include"

cargo build --target aarch64-apple-darwin --release
cargo build --target aarch64-apple-ios --release
cargo build --target aarch64-apple-ios-sim --release

mkdir -p "${NEW_HEADER_DIR}"
mkdir -p "${OUTDIR}"
cp "${HEADERPATH}" "${NEW_HEADER_DIR}/"
cp "../bindings/qsharp_bridgeFFI.modulemap" "${NEW_HEADER_DIR}/module.modulemap"

rm -rf "${OUTDIR}/${NAME}_framework.xcframework"

xcodebuild -create-xcframework \
    -library "${TARGETDIR}/aarch64-apple-darwin/${RELDIR}/${STATIC_LIB_NAME}" \
    -headers "${NEW_HEADER_DIR}" \
    -library "${TARGETDIR}/aarch64-apple-ios/${RELDIR}/${STATIC_LIB_NAME}" \
    -headers "${NEW_HEADER_DIR}" \
    -library "${TARGETDIR}/aarch64-apple-ios-sim/${RELDIR}/${STATIC_LIB_NAME}" \
    -headers "${NEW_HEADER_DIR}" \
    -output "${OUTDIR}/${NAME}_framework.xcframework"