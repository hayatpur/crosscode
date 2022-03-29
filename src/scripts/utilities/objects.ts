import * as RFDC from './rfdc.js'

export function clone<T>(obj: T, d = 0): T {
    return RFDC.RFDCclone(obj)
}
