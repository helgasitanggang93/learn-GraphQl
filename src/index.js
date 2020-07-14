import {GraphQLServer } from 'graphql-yoga';
import uuidv4 from 'uuid/v4';
//Type Definition (Schema)
//GraphQl has Scalar Types: String, Boolean, Int, Float, ID
//The meaning of exclamation mark(!) in typedefs is required, if we remove the (!), it means we can returning null
// User Data from database
const users = [{
  id: '1',
  name: 'Willybroddus',
  email:'willy@mail.com',
  age: 22
}, {
  id: '2',
  name: 'Helga',
  email:'helga@mail.com',
  age: 23
}, {
  id: '3',
  name: 'Alphandito',
  email:'alphandito@mail.com',
  age: 24
},{
  id: '4',
  name: 'Sitanggang',
  email:'sitanggang@mail.com',
  age: 25
}]

const posts = [{
  id:'1',
  title:'Merinding Disko',
  body:'Suatu hari...',
  published:true,
  author: '2'
}, {
  id:'2',
  title:'Setan Alas',
  body:'Suatu hari...',
  published:true,
  author: '3'
}, {
  id:'3',
  title:'Love me like you do',
  body:'Suatu hari...',
  published:false,
  author: '1'
}]
const commentsData = [{
  id:'1',
  text:'Nice pic',
  author: '1',
  post:'1'
}, {
  id:'2',
  text:'Pap dong',
  author:'2',
  post:'3'
},  {
  id:'3',
  text:'Peninggi badan',
  author:'1',
  post:'3'
},  {
  id:'4',
  text:'Apa ini?',
  author: '4',
  post:'2'
}]
const typeDefs = `
  type Query {
    greeting(name:String, position:String):String!
    userCollection(query:String): [Me!]!
    postCollection(query:String): [Post!]!
    comments(query:String):[Comment!]!
    allUser:[Me!]!
    add(a:Float!, b:Float!):Float!
    grades: [Int]!
    addArr(numbers: [Float!]!): Float!
    post: Post!
    me: Me!
    isLogin:Boolean!
  }

  type Mutation {
    createUser(data: CreateUserInput!): Me!
    createPost(data: CreatePostInput):Post!
    createComment(data: CreateCommentInput): Comment!
  }

  input CreateUserInput {
    name: String!, 
    email: String!, 
    age:Int
  }

  input CreatePostInput {
    title:String!
    body:String!
    published:Boolean!
    author:ID!
  }

  input CreateCommentInput {
    text: String!, 
    author:ID!, 
    post:ID!
  }

  type Comment {
    id:ID!
    text:String!
    author:Me!
    post:Post!
  }

  type Post {
    id: ID!
    title:String!
    body:String!
    published:Boolean!
    author:Me!
    comments:[Comment!]!
  }

  type Me {
    id:ID!
    name: String!
    email:String!
    age:Int
    allPost:[Post!]!
    allComment:[Comment!]!
  }

`

//Resolvers
const resolvers = {
  Query: {
    comments(parent, args, ctx, info){
      if(!args.query){
        return commentsData
      }
    },
    userCollection(parent, args, ctx, info){
      if(!args.query){
        return users
      }

      return users.filter(el => {
        return el.name.toLowerCase().includes(args.query.toLowerCase())
      })
    },
    postCollection(parent, args, ctx, info){
      if(!args.query){
        return posts
      }

      return posts.filter(el => {
        const isTitleMatch = el.title.toLowerCase().includes(args.query.toLowerCase())
        const isBodyMatch = el.body.toLowerCase().includes(args.query.toLowerCase())
        return isTitleMatch || isBodyMatch
      })
    },
    allUser(parent, args, ctx, info) {
      return users
    },
    post() {
      return{
        id:'abcd123',
        title:'Makan Siang',
        body:'Hari ini aku sedang makan siang',
        published: true
      }
    },
    me() {
      return {
        id:'bababa123',
        name:'Helga',
        email:'helga@mail.example.com',
        age: 22
      }
    },
    greeting(parent, args, ctx, info) {
      if(args.name && args.position){
        return `hello i'm ${args.name} and my location at ${args.position}`
      }
      return `hello i'm from nowhere`
    },
    add(parent, args, ctx, info){
      if(args.a && args.b){
        return args.a + args.b
      }else {
        return 0.0
      }
    },
    addArr(parent, args, ctx, info){
      if(args.numbers.length === 0){
        return 0
      }

      return args.numbers.reduce((accumulator, currentValue) => {
        return accumulator + currentValue
      })
    },
    grades(parent, args, ctx, info) {
      return [1,2,3,4,5]
    },
    isLogin() {
      return true
    }
  },
  Mutation: {
    createUser(parent, args, ctx, info){
      const emailTaken = users.some((user) => {
        return user.email === args.data.email
      })
      if(emailTaken){
        throw new Error('Email taken')
      }

      const newUser = {
        id: uuidv4(),
        ...args.data
      }

      users.push(newUser)
      return newUser
    },
    createPost(parent, args, ctx, info){
      const userExist = users.some((user) => user.id === args.data.author)

      if(!userExist){
        throw new Error('User Not Found')
      }

      const newPost = {
        id: uuidv4(),
        ...args.data
      }

      posts.push(newPost)
      return newPost
    },
    createComment(parent, args, ctx, info){
      const userExist = users.some((user) => user.id === args.data.author)
      const postExist = posts.some((post) => post.id === args.data.post && post.published === true)
      if(!userExist){
        throw new Error('user not exist')
      }else if(!postExist){
        throw new Error("post doesn't exist or the post not published yet")
      }

      const newComment = {
        id: uuidv4(),
        ...args.data
      }

      commentsData.push(newComment)
      return newComment

    }
  },
  Post: {
    author(parent, args, ctx, info){
      return users.find((user) => {
        return user.id === parent.author
      })
    },
    comments(parent, args, ctx, info){
      return commentsData.filter((comment) => {
        return comment.author === parent.id
      })
    }
  },
  Me: {
    allPost(parent, args, ctx, info){
      return posts.filter((post) => {
        return post.author === parent.id
      })
    },
    allComment(parent, args, ctx, info){
      return commentsData.filter((comment) => {
        return comment.author === parent.id
      })
    }
  },
  Comment: {
    author(parent, args, ctx, info){
      return users.find((user) => {
        return user.id === parent.author
      })
    },
    post(parent, args, ctx, info){
      return posts.find((post) => {
        return post.id === parent.post
      })
    }
  }
}

const server = new GraphQLServer({
  typeDefs,
  resolvers
})

server.start(() => {
  console.log('the server is up!');
  
})

