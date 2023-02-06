import { original } from "@reduxjs/toolkit";
import {createApi, fetchBaseQuery} from "@reduxjs/toolkit/query/react"
import { logOut, setCredentials } from "../../features/auth/authSlice";

/*
    Credentials are cookies, authorization headers, or TLS client certificates.
    The Access-Control-Allow-Credentials response header tells browsers whether to expose
    the response to the frontend JavaScript code when the request's credentials mode
    (Request.credentials) is include.
*/
const baseQuery = fetchBaseQuery({
    baseUrl: 'http://localhost:3500',
    // attaching cookies to headers for every request
    credentials: 'include',
    prepareHeaders: (headers, { getState }) => {
        // attaching access-token to headers for every request
        const token = getState().auth.token;
        if (token) {
            headers.set("authorization", `Bearer ${token}`);
        }
        return headers;
    }
});

/*
Implementing a custom baseQuery:
The signature is:    
    const customBaseQuery = ( args,  { signal, dispatch, getState }, extraOptions) => {
        // omitted

        return { data: YourData }
        Expected error result format
        return { error: YourError }
    }
*/
const baseQueryWithReauth = async (args, api, extraOptions) => {
    let result = await baseQuery(args, api, extraOptions);
    
    if (result?.error?.originalStatus === 403) {
        console.log("sending refresh token");
        // send refresh token to get new access token
        const refreshResult = await baseQuery("/refresh", api, extraOptions);
        console.log("refreshResult", refreshResult);
        if (refreshResult?.data) {
            const user = api.getState().auth.user;
            // strore the new token
            api.dispatch(setCredentials({ ...refreshResult.data, user }));
            // retry the original query with new access token
            result = await baseQuery(args, api, extraOptions);
        } else {
            api.dispatch(logOut());
        }
    }

    return result;
}

export const apiSlice = createApi({
    baseQuery: baseQueryWithReauth,
    endpoints: builder => ({})
});




    