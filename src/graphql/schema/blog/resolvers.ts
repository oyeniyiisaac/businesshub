import { blogs } from "@/src/data/blogs";

type createBlog = {
    id? : string;
    title: string;
    content: string;
    author: string;
};

export const resolvers = {
    Query:{
        blogs: () => blogs,
        blog: (_: any, {id}: {id: string}) => blogs.find(blog => blog.id === parseInt(id))
    },
    Mutation: {
        createBlog: (_: any, {title, content, author}: createBlog) => {
            const newBlog = {
                id: blogs.length + 1,
                title,
                content,
                author
            }
            blogs.push(newBlog)
            return newBlog
        },

        updateBlog: (_: any, {id, title, content, author}: createBlog) => {
            const blogIndex  = blogs.findIndex((blog) => blog.id === parseInt(id!))
            if(blogIndex === -1) return null;
            const updatedBlog = {
                ...blogs[blogIndex],
                title: title || blogs[blogIndex].title,
                content: content || blogs[blogIndex].content,
                author: author || blogs[blogIndex].author
            }
            blogs[blogIndex] = updatedBlog;
            return updatedBlog; 
        }
    }
}