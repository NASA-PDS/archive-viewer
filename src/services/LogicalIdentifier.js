export default class LogicalIdentifier {

    constructor(original, vid) {
        if(!original) { return }
        let identifier = original.toLowerCase()
        if(!!vid) {
            this.lidvid = `${identifier}::${vid}`
            this.lid = identifier
            this.vid = vid
        } else {
            this.lidvid = identifier
            let [lid, version] = identifier.split('::')
            this.lid = lid
            this.vid = version
        }
    }

    get escapedLid() {
        return escape(this.lid)
    }
    get escaped() {
        return escape(this.lidvid)
    }
    get escapedVid() {
        return escape(this.vid)
    }
    get normalizedLid() {
        return normalize(this.lid)
    }
    get denormalizedLid() {
        return denormalize(this.lid)
    }
}
function escape(str) {
    return str.replace(/:/g, '\\:')
}
function normalize(str) {
    return str.replace(/:/g,'%3A') + '/'
}
function denormalize(str) {
    if (str.split('')[str.length - 1] === '/') {
        // still not sure if this ever happens... but it seems like it should
        str.pop()
    }
    return str.replace(/%3[A,a]/g,':')
}