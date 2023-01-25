let _backupMode = false
let _forcedBackupMode = false

const setBackupMode = (value) => {
    _backupMode = !!value
    if(_forcedBackupMode) { console.log('Forced backup mode is active, ignoring request to set backup mode to ' + value) }
}

const setForcedBackupMode = (value) => {
    _forcedBackupMode = !!value
}

export default { 
    get backupMode() { return _backupMode || _forcedBackupMode },
    setBackupMode,
    setForcedBackupMode }