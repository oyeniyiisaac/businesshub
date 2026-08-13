import { HttpLink } from "@apollo/client";
import { InMemoryCache } from "@apollo/client";
import { ApolloClient } from "@apollo/client";

const httpLink = new HttpLink({
    uri: "api/graphql",
})
const client = new ApolloClient({
    link: httpLink,
    cache: new InMemoryCache(),
})

export default client;