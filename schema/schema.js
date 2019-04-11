const graphql = require('graphql');
const axios = require('axios');
const API_BASE = "http://localhost:3000";

const {
    GraphQLObjectType,
    GraphQLInt,
    GraphQLString,
    GraphQLSchema,
    GraphQLList,
    GraphQLNonNull
} = graphql;

/* 
Company type
  creating a type 'GraphQLObjectType' :
  1 - the name shoud be camelcase (always the first lettre is uppercase)
  2 - the fields is a function to avoid cerclaire reference issue 
  
    Company <------ User (a user has a company id )
*/
const CompanyType = new GraphQLObjectType({
    name: 'Company',
    fields: () => ({
        id: {
            type: GraphQLString
        },
        name: {
            type: GraphQLString
        },
        description: {
            type: GraphQLString
        },
        users: {
            type: new GraphQLList(UserType),
            resolve(parentValue, args) {
                return axios.get(`${API_BASE}/companies/${parentValue.id}/users`)
                    .then(resp => resp.data);
            }
        }
    })
});

/*
User type 
the structure of a type is always the same - use the new opreator to create a GraphQLObjectType object
that has the follwoing properties :
    name -> this is the name the instance type (uppercase the first character)
    fields -> this an object in which it holds all the columns properties with its type, 
    the field type can be:
                         - Primitive type : no need for resolver function
                         - Custom type : needs a resolver 
*/
const UserType = new GraphQLObjectType({
    name: 'User',
    fields: () => ({
        id: {
            type: GraphQLString
        },
        firstName: {
            type: GraphQLString
        },
        age: {
            type: GraphQLInt
        },
        company: {
            type: CompanyType,
            resolve(parentValue, args) {
                // console.log(parentValue,args)
                return axios.get(`${API_BASE}/companies/${parentValue.companyId}`)
                    .then(resp => resp.data);
            }
        }
    })
});

/*
 same as above but the fields content are custom type instances
*/
const RootQuery = new GraphQLObjectType({
    name: 'RootQueryType',
    fields: {
        user: {
            type: UserType,
            args: {
                id: {
                    type: GraphQLString
                }
            },
            resolve(parentValue, args) {
                return axios.get(`${API_BASE}/users/${args.id}`)
                    .then(resp => resp.data);
            }
        },
        company: {
            type: CompanyType,
            args: {
                id: {
                    type: GraphQLString
                }
            },
            resolve(parentValue, args) {
                return axios.get(`${API_BASE}/companies/${args.id}`)
                    .then(resp => resp.data);
            }
        }
    }
});

const mutation = new GraphQLObjectType({
    name: "Mutation",
    fields: {
        addUser: {
            type: UserType,
            args: {
                firstName: {
                    type: new GraphQLNonNull(GraphQLString)
                },
                age: {
                    type: new GraphQLNonNull(GraphQLInt)
                },
                companyId: {
                    type: GraphQLString
                }
            },
            resolve(parentValue, {
                firstName,
                age
            }) {
                return axios.post(`${API_BASE}/users`, {
                        firstName,
                        age
                    })
                    .then(resp => resp.data);

            }
        },
        editUser: {
            type: UserType,
            args: {
                id: {
                    type: new GraphQLNonNull(GraphQLString)
                },
                firstName: {
                    type: GraphQLString
                },
                age: {
                    type: GraphQLInt
                },
                companyId: {
                    type: GraphQLString
                }
            },
            resolve(parentValue, args) {
                console.log(args);// when a proterty is not provided simply it will not be added to the object
                return axios.patch(`${API_BASE}/users/${args.id}`,args)
                    .then(resp => resp.data);

            }
        }
    }
})

//module.exports (attention exports with s ) this node system module 
module.exports = new GraphQLSchema({
    query: RootQuery,
    mutation
});