import React from "react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";

const ApiDocs: React.FC = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold tracking-tight">API Documentation</h2>
      <p className="text-gray-600">
        Welcome to the RealSync API documentation. Here you'll find all the
        information you need to integrate RealSync into your applications.
      </p>

      <Tabs defaultValue="authentication">
        <TabsList>
          <TabsTrigger value="authentication">Authentication</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="tunnels">Tunnels</TabsTrigger>
          <TabsTrigger value="plans">Plans</TabsTrigger>
        </TabsList>

        <TabsContent value="authentication">
          <Card className="bg-white">
            <CardHeader>
              <CardTitle>Authentication</CardTitle>
              <CardDescription>
                Learn how to authenticate your API requests
              </CardDescription>
            </CardHeader>
            <CardContent>
              <h3 className="text-lg font-semibold mb-2">Bearer Token</h3>
              <p className="mb-4">
                All API requests must be authenticated using a bearer token.
                Include the token in the Authorization header of your requests.
              </p>
              <pre className="bg-gray-100 p-4 rounded-md overflow-x-auto">
                <code>Authorization: Bearer YOUR_API_TOKEN</code>
              </pre>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users">
          <Card className="bg-white">
            <CardHeader>
              <CardTitle>Users API</CardTitle>
              <CardDescription>Endpoints for managing users</CardDescription>
            </CardHeader>
            <CardContent>
              <h3 className="text-lg font-semibold mb-2">Get User</h3>
              <p className="mb-2">
                <strong>GET</strong> /api/users/:id
              </p>
              <p className="mb-4">
                Retrieve information about a specific user.
              </p>
              <h4 className="font-semibold mb-2">Example Response:</h4>
              <pre className="bg-gray-100 p-4 rounded-md overflow-x-auto">
                <code>
                  {JSON.stringify(
                    {
                      id: "123",
                      name: "John Doe",
                      email: "john@example.com",
                      plan: "pro",
                    },
                    null,
                    2
                  )}
                </code>
              </pre>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tunnels">
          <Card className="bg-white">
            <CardHeader>
              <CardTitle>Tunnels API</CardTitle>
              <CardDescription>
                Endpoints for managing secure tunnels
              </CardDescription>
            </CardHeader>
            <CardContent>
              <h3 className="text-lg font-semibold mb-2">Create Tunnel</h3>
              <p className="mb-2">
                <strong>POST</strong> /api/tunnels
              </p>
              <p className="mb-4">Create a new secure tunnel.</p>
              <h4 className="font-semibold mb-2">Example Request:</h4>
              <pre className="bg-gray-100 p-4 rounded-md overflow-x-auto mb-4">
                <code>
                  {JSON.stringify(
                    {
                      name: "My Tunnel",
                      localPort: 8080,
                      remotePort: 80,
                    },
                    null,
                    2
                  )}
                </code>
              </pre>
              <h4 className="font-semibold mb-2">Example Response:</h4>
              <pre className="bg-gray-100 p-4 rounded-md overflow-x-auto">
                <code>
                  {JSON.stringify(
                    {
                      id: "t-123",
                      name: "My Tunnel",
                      localPort: 8080,
                      remotePort: 80,
                      status: "active",
                    },
                    null,
                    2
                  )}
                </code>
              </pre>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="plans">
          <Card className="bg-white">
            <CardHeader>
              <CardTitle>Plans API</CardTitle>
              <CardDescription>
                Endpoints for managing subscription plans
              </CardDescription>
            </CardHeader>
            <CardContent>
              <h3 className="text-lg font-semibold mb-2">List Plans</h3>
              <p className="mb-2">
                <strong>GET</strong> /api/plans
              </p>
              <p className="mb-4">
                Retrieve a list of available subscription plans.
              </p>
              <h4 className="font-semibold mb-2">Example Response:</h4>
              <pre className="bg-gray-100 p-4 rounded-md overflow-x-auto">
                <code>
                  {JSON.stringify(
                    [
                      {
                        id: "basic",
                        name: "Basic Plan",
                        price: 9.99,
                        features: ["1 tunnel", "5 GB transfer"],
                      },
                      {
                        id: "pro",
                        name: "Pro Plan",
                        price: 19.99,
                        features: ["5 tunnels", "50 GB transfer"],
                      },
                    ],
                    null,
                    2
                  )}
                </code>
              </pre>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ApiDocs;
