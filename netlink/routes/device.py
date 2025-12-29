from fastapi import Depends, status, APIRouter
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from typing import Optional
from pydantic import BaseModel
import db.db_models as db_models
from db.init import engine, get_db
from middleware.middleware import get_current_user
from datetime import timezone

db_models.Base.metadata.create_all(bind=engine)
router = APIRouter(prefix="/device")

class DeviceRegister(BaseModel):
    node_id: str
    node_name: Optional[str] = None
    paddock_id: int

def generate_node_name(count: int) -> str:
    return f"Device-{count + 1}"

@router.get("/view/{node_id}/{data_t}", tags=["device"], description="Get all readings for a device.")
async def get_device_data(
    node_id: str,
    data_t: str,
    db: Session = Depends(get_db),                 # <-- DIRECT dependency
    current_user: db_models.user = Depends(get_current_user)
):
    # Find the device
    device = (
        db.query(db_models.active_node)
        .filter_by(node_id=node_id)
        .first()
    )

    if not device:
        return JSONResponse(
            {"success": False, "message": f"Device '{node_id}' not found."},
            status_code=status.HTTP_404_NOT_FOUND,
        )

    # Check ownership
    if device.user_id != current_user.user_id:
        return JSONResponse(
            {"success": False, "message": "You do not have access to this device."},
            status_code=status.HTTP_403_FORBIDDEN,
        )
    
    if data_t not in ["temperature", "ph"]:
        return JSONResponse(
            {"success": False, "message": f"Data type '{data_t}' is invalid."},
            status_code=status.HTTP_400_BAD_REQUEST,
        )

    # Fetch readings
    readings = (
        db.query(db_models.reading)
        .filter_by(node_id=node_id)
        .filter_by(reading_type=data_t)
        .order_by(db_models.reading.timestamp)
        .all()
    )

    readings_list = []
    for r in readings:
        ts = r.timestamp

        # If timestamp is naive, assume it's in UTC
        if ts.tzinfo is None:
            ts = ts.replace(tzinfo=timezone.utc)

        # Convert to local timezone automatically
        local_ts = ts.astimezone()

        iso_ts = local_ts.isoformat()

        readings_list.append({
            "reading_type": r.reading_type,
            "reading_val": r.reading_val,
            "timestamp": iso_ts,
        })


    return JSONResponse(
        {
            "success": True,
            "node_id": device.node_id,
            "node_name": device.node_name,
            "paddock_id": device.paddock_id,
            "readings": readings_list,
        },
        status_code=status.HTTP_200_OK,
    )



@router.post("/register", tags=["device"], description="Updates an existing device.")
async def register_device(
    device_to_register: DeviceRegister,
    db: Session = Depends(get_db),                 # <-- DIRECT dependency
    current_user: db_models.user = Depends(get_current_user)
):
    # Find device
    existing_node = (
        db.query(db_models.active_node)
        .filter_by(node_id=device_to_register.node_id)
        .first()
    )

    if not existing_node:
        return JSONResponse(
            {"success": False, "message": f"Device '{device_to_register.node_id}' not found"},
            status_code=status.HTTP_404_NOT_FOUND,
        )

    if existing_node.user_id is not None:
        return JSONResponse(
            {"success": False, "message": f"Device '{device_to_register.node_id}' already linked"},
            status_code=status.HTTP_409_CONFLICT,
        )

    # Generate node_name if not provided
    node_name = device_to_register.node_name
    if not node_name:
        device_count = (
            db.query(db_models.active_node)
            .filter_by(user_id=current_user.user_id)
            .count()
        )
        node_name = generate_node_name(device_count)

    # Update device
    existing_node.node_name = node_name
    existing_node.paddock_id = device_to_register.paddock_id
    existing_node.user_id = current_user.user_id

    db.commit()
    db.refresh(existing_node)

    return JSONResponse(
        {
            "success": True,
            "message": "Paddock updated successfully",
            "node": {
                "node_id": existing_node.node_id,
                "node_name": existing_node.node_name,
                "paddock_id": existing_node.paddock_id,
            },
        },
        status_code=status.HTTP_200_OK,
    )
