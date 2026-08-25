import gql from "graphql-tag";

export const typeDefs = gql`
    type ResetPasswordResponse {
        success: Boolean!
        message: String!
    }

    type Mutation {
        forgetPassword(workEmail: String!): ResetPasswordResponse!
        resetForgotPasswordWithOtp(email: String!, otp: String!, newPassword: String!): ResetPasswordResponse!
        resetForgotPassword(token: String!, newPassword: String!): ResetPasswordResponse!
    }
`;