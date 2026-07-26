import {
  data as remixData,
  Form,
  NavLink,
  Outlet,
  useLoaderData,
} from 'react-router';
import type {Route} from './+types/account';
import {CUSTOMER_DETAILS_QUERY} from '~/graphql/customer-account/CustomerDetailsQuery';
import {SITE_NAME} from '~/lib/seo';

export function shouldRevalidate() {
  return true;
}

export async function loader({context}: Route.LoaderArgs) {
  const {customerAccount} = context;
  const {data, errors} = await customerAccount.query(CUSTOMER_DETAILS_QUERY, {
    variables: {
      language: customerAccount.i18n.language,
    },
  });

  if (errors?.length || !data?.customer) {
    throw new Error('Customer not found');
  }

  return remixData(
    {customer: data.customer},
    {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    },
  );
}

export const meta: Route.MetaFunction = () => [
  {title: `Your account | ${SITE_NAME}`},
  // Account pages are private by definition.
  {name: 'robots', content: 'noindex, nofollow'},
];

export default function AccountLayout() {
  const {customer} = useLoaderData<typeof loader>();

  const heading = customer?.firstName
    ? `Hello, ${customer.firstName}.`
    : 'Your account.';

  return (
    <div className="account">
      <span className="msc-kicker">The guest book</span>
      <h1>{heading}</h1>
      <p className="account-lead">
        Orders, addresses, and the details we need to send a shirt to the right
        place. Nothing else is kept here.
      </p>
      <AccountMenu />
      <div className="account-panel">
        <Outlet context={{customer}} />
      </div>
    </div>
  );
}

const ACCOUNT_TABS = [
  {to: '/account/orders', label: 'Orders'},
  {to: '/account/profile', label: 'Profile'},
  {to: '/account/addresses', label: 'Addresses'},
];

function AccountMenu() {
  return (
    <nav className="account-menu" role="navigation" aria-label="Account">
      {ACCOUNT_TABS.map((tab) => (
        <NavLink key={tab.to} to={tab.to} className="account-tab">
          {tab.label}
        </NavLink>
      ))}
      <Logout />
    </nav>
  );
}

function Logout() {
  return (
    <Form className="account-logout" method="POST" action="/account/logout">
      <button className="account-tab account-tab--signout" type="submit">
        Sign out
      </button>
    </Form>
  );
}
