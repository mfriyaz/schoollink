const swaggerJsdoc = require("swagger-jsdoc");

const options = {

    definition: {

        openapi: "3.0.3",

        info: {

            title: "SchoolLink ERP API",

            version: "1.0.0",

            description:
                "REST API documentation for SchoolLink ERP"

        },

        servers: [

            {
                url: "http://localhost:3001",
                description: "Local Development Server"
            }

        ],

        components: {

            securitySchemes: {

                bearerAuth: {

                    type: "http",

                    scheme: "bearer",

                    bearerFormat: "JWT"

                }

            }

        },

        security: [

            {
                bearerAuth: []
            }

        ]

    },

    apis: [

        "./src/routes/*.js"

    ]

};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;