import gql from "graphql-tag";

export const typeDefs = gql`

    type Blog{
    id: ID!
    title: String!
    content: String!
    author: String!
    }

    type Query{
        blogs: [Blog!]!
        blog(id: ID!): Blog
    }
        type Mutation{
        createBlog(title: String!, content: String!, author: String!): Blog!
        updateBlog(id: ID!, title: String, content: String, author: String): Blog
    }
`;