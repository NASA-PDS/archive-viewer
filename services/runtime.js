let _backupMode = false
let _forced = false

let instance = Math.random().toString(36).substring(7)

const setBackupMode = (value, forced) => {
    console.log(`[${instance}] Setting backup mode to ${value}`)
    if(_forced && !forced) { 
        console.log(`[${instance}] Forced backup mode is active, ignoring request to set backup mode to  ${value}`) 
        return
    }
    _backupMode = !!value
    _forced = forced == true
}
const ENABLE_BACKUP_MODE_MESSAGE = 'ENABLE_BACKUP_MODE'
const DISABLE_BACKUP_MODE_MESSAGE = 'DISABLE_BACKUP_MODE'

// export an object with a dynamic getter, and a setter
export default { 
    ENABLE_BACKUP_MODE_MESSAGE,
    DISABLE_BACKUP_MODE_MESSAGE,
    get backupMode() { 
        // console.log(`[${instance}] Getting backup mode: ${_backupMode}`)
        return _backupMode
    },
    setBackupMode }

export const config = {
    runtime: 'nodejs',
}
