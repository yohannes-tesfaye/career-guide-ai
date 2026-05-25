import { authClient } from "@/lib/auth-client" // import the auth client

const { data: session, error } = await authClient.getSession()


