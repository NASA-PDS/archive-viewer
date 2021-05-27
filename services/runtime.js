let _backupMode = false

const setBackupMode = (value) => {
    _backupMode = !!value
}

export default { 
    get backupMode() { return _backupMode },
    setBackupMode }