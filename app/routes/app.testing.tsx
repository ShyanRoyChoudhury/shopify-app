import { type LoaderFunction } from "@remix-run/node";
import { Page } from "@shopify/polaris";
import { authenticate } from "~/shopify.server";

export const loader: LoaderFunction = async ({ request }) => {
    const { session } = await authenticate.admin(request);

    const { accessToken } = session;
    console.log('access Token: ',accessToken)
    return null
}

export default function TestingPage(){
    return(
        <Page> Testing Page</Page>
    )
}