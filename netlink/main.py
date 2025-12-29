from fastapi import FastAPI, Response, status
from fastapi.middleware.httpsredirect import HTTPSRedirectMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.middleware.cors import CORSMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

from fastapi.middleware.cors import CORSMiddleware

import routes.auth as auth
import routes.paddock as paddock
import routes.device as device

from middleware.limiters import limiter
from middleware.middleware import get_quote_of_the_day

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],  # Or ["GET", "POST", "DELETE"]
    allow_headers=["*"],
)

app.add_middleware(GZipMiddleware, minimum_size=1000)

app.include_router(auth.router)
app.include_router(paddock.router)
app.include_router(device.router)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

@app.get("/", tags=["Debugging"], status_code=status.HTTP_200_OK, description="A NETLINK API DEBUGGING request to check if the API is alive. Returns a QOTD.")
def read_root():
    qotd = get_quote_of_the_day()
    return Response(f"Server is Up\nQuote of the Day: \n'{qotd}'")

