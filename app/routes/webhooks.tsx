import type { ActionFunctionArgs } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import db from "../db.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  const { topic, shop, session, admin, payload } = await authenticate.webhook(request);

  if (!admin) {
    // The admin context isn't returned if the webhook fired after a shop was uninstalled.
    throw new Response();
  }
  console.log('payload: ', payload)
  // The topics handled here should be declared in the shopify.app.toml.
  // More info: https://shopify.dev/docs/apps/build/cli-for-apps/app-configuration
  switch (topic) {
    case "APP_UNINSTALLED":
      if (session) {
        try{
          await db.session.deleteMany({ where: { shop } });
          return new Response("Uninstall", {status:200});
        }catch(e){
          console.log('Error uninstalling: ', e)
          return new Response("Error uninstall", { status: 500})
        }
      }

      break;
      case "ORDERS_CREATE":
        console.log('---- hit orders create webhook -------')
        try{
          const { id, name, cart_token, currency, total_price, created_at, updated_at } = payload;
          await db.order.create({
            data: {
              id: id.toString(),
              name,
              cart_token,
              currency,
              price: total_price,
              created_at,
              updated_at,
            }
          })
          return new Response("Orders created", { status: 200 })
        }catch(e){
          console.log("Error updating db: ",e)
          return new Response("Orders created", { status: 500 })
        }
        break;
      case "ORDERS_UPDATED": 
        console.log('----- hit orders update webhook -------')
        return new Response("Orders updated webhook received", { status: 200 })
    case "CUSTOMERS_DATA_REQUEST":
      if (session) {

        return new Response("Customer data request", {status:200});
        
      }
      break;
    case "CUSTOMERS_REDACT":
      break;
    case "SHOP_REDACT":
      break;
    default:
      throw new Response("Unhandled webhook topic", { status: 404 });
  }

  throw new Response();
};
