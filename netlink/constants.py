import os
from dotenv import load_dotenv

script_dir = os.path.dirname(__file__)
dotenv_path = os.path.join(script_dir, '..', '.env')

if not os.getenv('GITHUB_ACTIONS'):
    load_dotenv()
else:
    MINIO_IPV4: str = os.getenv('MINIO_IPV4')
    MINIO_PORT: int = os.environ.get('MINIO_PORT')
    ACCESS_KEY: str = os.environ.get('ACCESS_KEY')
    SECRET_KEY: str = os.environ.get('SECRET_KEY')
    DB_USER: str = os.getenv('DB_USER')
    DB_PASSWORD: str = os.getenv('DB_PASSWORD')
    IPV4: str = os.getenv('IPV4') ##change to ip address type
    PORT_NUMBER: int = os.getenv('PORT_NUMBER')
    DB_DATABASE: str = os.getenv('DB_DATABASE')
    DEF_USER: str = os.environ.get('DEF_USER')
    DEF_PASS: str = os.environ.get('DEF_PASS')

MINIO_IPV4: str = os.environ.get('MINIO_IPV4')
MINIO_PORT: int = os.environ.get('MINIO_PORT')
ACCESS_KEY: str = os.environ.get('ACCESS_KEY')
SECRET_KEY: str = os.environ.get('SECRET_KEY')

DB_USER: str = os.getenv('DB_USER')
DB_PASSWORD: str = os.getenv('DB_PASSWORD')
IPV4: str = os.getenv('IPV4') ##change to ip address type
PORT_NUMBER: int = os.getenv('PORT_NUMBER')
DB_DATABASE: str = os.getenv('DB_DATABASE')

DEF_USER: str = os.environ.get('DEF_USER')
DEF_PASS: str = os.environ.get('DEF_PASS')

FCS_KEY_JSON: str = os.environ.get('FCS_KEY_JSON')