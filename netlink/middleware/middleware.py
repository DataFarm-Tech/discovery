import requests
from db.init import get_db
from sqlalchemy.orm import Session
from fastapi import Depends, status, HTTPException
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
import db.db_models as db_models

# oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/token")


ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 90
SECRET_KEY = "650FX$IyZT/XWn>£2/nL£PR?=%N"
ALGORITHM = "HS256"

"""
Retrieves the quote of the day from the FavQs API.

This function sends a GET request to the FavQs API's Quote of the Day endpoint
and retrieves the quote of the day. If successful, it returns the body of the
quote. If the request fails or the response does not contain a valid quote,
it returns a default error message.

Returns:
    str: The body of the quote of the day if successful, or an error message
    indicating the failure to fetch the quote.

"""
def get_quote_of_the_day():
    response = requests.get("https://favqs.com/api/qotd")
    data = response.json()
    if 'quote' in data:
        return data['quote']['body']
    else:
        return "Failed to fetch the quote of the day."

"""
    Retrieves the currently authenticated user based on the provided JWT token.

    This function decodes the JWT access token to extract the user ID (`sub` field),
    then queries the database to fetch the corresponding user. If the token is invalid,
    expired, missing required data, or if the user does not exist, an HTTP 401
    Unauthorized error is raised.

    Args:
        token (str): The JWT access token provided via OAuth2 authentication.
        db (Session): SQLAlchemy database session dependency.

    Returns:
        user (db_models.user): The authenticated user object.

    Raises:
        HTTPException: If the token is invalid or the user cannot be validated.
    """

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user = db.query(db_models.user).filter(db_models.user.user_id == user_id).first()
    if not user:
        raise credentials_exception
    return user