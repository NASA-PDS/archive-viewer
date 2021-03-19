export default class LogicalIdentifier {

    constructor(original, vid) {
        if(!original || typeof original !== 'string') { throw new Error('Invalid Logical Identifier ' + original) }
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

    get isContextObject() {
        // split up lid
        const [urn, nasa, pds, context, ...otherParts] = this.lid.split(":")
        
        // assert individual parts
        return (urn === "urn" &&
            nasa === "nasa" &&
            pds === "pds" &&
            context === "context") 
    }
    get finalFragment() {
        let fragments =  this.lid.split(":")
        return fragments[fragments.length-1]
    }

}
function escape(str) {
    return str.replace(/:/g, '\\:')
}