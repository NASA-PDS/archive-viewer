import FrontPage from 'components/pages/FrontPage'
import { setTheme } from 'services/pages'

export default function Index(props) {
    return (
        <FrontPage {...props}/>
    )
}

// redirect previous URL formats (lid as query string parameter) to new address
export async function getServerSideProps(context) {
    const { query, res } = context
    let { identifier, dataset, target, instrument, mission, spacecraft, ...otherQueries } = query

    identifier = identifier || dataset || target || instrument || mission || spacecraft

    if (!!identifier) {
        const combined = Object.keys(otherQueries).map(q => `${q}=${otherQueries[q]}`).join('&')
        res.setHeader('Location', `/${identifier}${combined ? '?' + combined : combined}`);
        res.statusCode = 301;
    }

    let props = {}
    setTheme(props, context)
    return { props }

}
