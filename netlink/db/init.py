from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy.pool import QueuePool
from constants import DB_USER, DB_PASSWORD, IPV4, PORT_NUMBER, DB_DATABASE


##DB_USER = "root"
##DB_PASSWORD = "RYy3GziqsVPPeP7abMzHZfSDj7DDKAX4vVMMfo"
##IPV4 = "45.79.239.100"
##PORT_NUMBER = "3306"
##DB_DATABASE = "df_dev"

URL_DATABASE = f'mysql+pymysql://{DB_USER}:{DB_PASSWORD}@{IPV4}:{PORT_NUMBER}/{DB_DATABASE}'

engine = create_engine(
    URL_DATABASE,
    poolclass=QueuePool,
    pool_size=5,               # Number of persistent connections
    max_overflow=10,           # Max connections beyond pool_size
    pool_timeout=30,           # Seconds to wait for a connection
    pool_recycle=3600,         # Recycle connections after 1 hour
    pool_pre_ping=True,        # Test connections before use
    connect_args={
        'connect_timeout': 10  # Connection timeout in seconds
    },
    echo=False,                # Set True to log SQL queries
    future=True,               # SQLAlchemy 2.0 compatibility
    isolation_level="REPEATABLE READ"  # MySQL default isolation level
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


"""
Creates a new database session for each request.

Yields:
- Session: A SQLAlchemy session object for database operations.

Usage:
```
db = get_db()
try:
    # Perform database operations using the session
finally:
    # Close the session after database operations are done
    db.close()
```
"""

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
