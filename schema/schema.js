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

module.exports = new GraphQLSchema({
    query: RootQuery,
    mutation
});