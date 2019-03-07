backend default {
    .host = "127.0.0.1";
    .port = "3001";
}

acl purge {
  "localhost";
  "127.0.0.1";
}

sub vcl_recv {
  if (req.url == "/marriage") {
    error 750 "/#marriage";
  }

  # only cache GET requests
  if (req.request == "GET") {
    return (lookup);
  }

  if (req.request == "PURGE") {
    if (!client.ip ~ purge) {
      error 405 "Method Not Allowed";
    }
    return(lookup);
  }

  # let everything else pass the cache
    return (pass);
}

sub vcl_hit {
  if (req.request == "PURGE") {
    purge;
    error 200 "Purged";
  }
}

sub vcl_miss {
  if (req.request == "PURGE") {
    purge;
    error 200 "Purged";
  }
}

sub vcl_error {
  if (obj.status == 750) {
    set obj.http.Location = obj.response;
    set obj.status = 301;
    return(deliver);
  }
}

sub vcl_fetch
{
  if ( beresp.status >= 400 ) {
    set beresp.ttl = 0s;
  }

  if (req.url ~ "https?://stat\.data\.abs\.gov\.au/sdmx-json") {
    // Remove the cookie so that the response can be cached.
    unset beresp.http.Set-Cookie;

    // The ABS SDMX-JSON API has a habit of returning HTML
    // responses with a 200 OK code on error.  Detect this and
    // return an error so that it is not cached.
    if (beresp.status == 200 && beresp.http.Content-Type ~ "text/html") {
      error 500 "Got 200 as HTML but expected JSON";
    }
  }

  if (req.url !~ "^/proxy/" && beresp.ttl <= 0s) {
    set beresp.http.Cache-Control = "public, max-age=60";
    set beresp.ttl = 60s;
  }
}
