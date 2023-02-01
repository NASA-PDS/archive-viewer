export default class LogicalIdentifier {

    constructor(original, vid) {
        if(!original || typeof original !== 'string' || !original.startsWith('urn:')) { throw new Error('Invalid Logical Identifier ' + original) }
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
        const [urn, org, group, context, ..._] = this.lid.split(":")
        
        // assert individual parts
        return (urn === "urn" &&
            context === "context") 
    }
    get isBundle() {
        return !this.isContextObject && this.lid.split(":").length === 4
    }
    get isCollection() {
        return !this.isContextObject && this.lid.split(":").length === 5
    }
    get isDataProduct() {
        return !this.isContextObject && this.lid.split(":").length === 6
    }
    get parentBundle() {
        return (this.isCollection || this.isDataProduct) ? this.lid.split(":").slice(0, 4).join(':') : null
    }
    get parentCollection() {
        return this.isDataProduct ? this.lid.split(":").slice(0, 5).join(':') : null
    }
    get finalFragment() {
        let fragments =  this.lid.split(":")
        return fragments[fragments.length-1]
    }

}
function escape(str) {
    return str.replace(/:/g, '\\:');
}