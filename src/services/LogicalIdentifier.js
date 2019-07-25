export default class LogicalIdentifier {

    constructor(lidvid) {
        if(!lidvid) { return }
        this.lidvid = lidvid

        let [lid, vid] = lidvid.split('::')
        this.lid = lid
        this.vid = vid
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

}
function escape(str) {
    return str.replace(/:/g, '\\:')
}