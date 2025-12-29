from fastapi import Depends, status, APIRouter
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Optional, Annotated
from pydantic import BaseModel
import db.db_models as db_models
from db.init import engine, get_db
from middleware.middleware import get_current_user
from typing import List
from datetime import datetime

db_dependency = Annotated[Session, Depends(get_db)]
db_models.Base.metadata.create_all(bind=engine)

router = APIRouter(prefix="/paddock")

class PaddockCreate(BaseModel):
    paddock_name: Optional[str] = None

class PaddockUpdate(BaseModel):
    paddock_name: str

def generate_paddock_name(count: int) -> str:
    """Generate a unique paddock name based on count"""
    counter = count + 1
    base_name = f"Paddock-{counter}"
    return base_name

@router.post("/create", tags=["paddock"], description="Creates a paddock.")
async def create_paddock(
    paddock_to_create: PaddockCreate,
    db: Session = Depends(get_db),
    current_user: db_models.user = Depends(get_current_user)
):
    # Generate name if not provided, otherwise use provided name
    if not paddock_to_create.paddock_name:
        paddock_count = db.query(db_models.paddock).filter(
            db_models.paddock.user_id == current_user.user_id
        ).count()
        paddock_name = generate_paddock_name(paddock_count)
    else:
        paddock_name = paddock_to_create.paddock_name
    
    # Check if a paddock with the same name already exists for this user
    existing_paddock = db.query(db_models.paddock).filter(
        db_models.paddock.user_id == current_user.user_id,
        db_models.paddock.paddock_name == paddock_name
    ).first()
    
    if existing_paddock:
        return JSONResponse(
            content={
                "success": False,
                "message": f"A paddock named '{paddock_name}' already exists"
            },
            status_code=status.HTTP_409_CONFLICT
        )
    
    new_paddock = db_models.paddock(
        paddock_name=paddock_name,
        user_id=current_user.user_id
    )
    
    db.add(new_paddock)
    db.commit()
    db.refresh(new_paddock)
    
    return JSONResponse(
        content={
            "success": True,
            "message": "Paddock created successfully"
        },
        status_code=status.HTTP_201_CREATED
    )

@router.get("/list", tags=["paddock"], description="Gets all paddocks for the current user.")
async def list_paddocks(
    db: Session = Depends(get_db),
    current_user: db_models.user = Depends(get_current_user)
):
    """
    Retrieves all paddocks belonging to the authenticated user
    """
    try:
        # Query all paddocks for the current user
        paddocks = db.query(db_models.paddock).filter(
            db_models.paddock.user_id == current_user.user_id
        ).order_by(db_models.paddock.paddock_id).all()
        
        # Convert to list of dictionaries
        paddocks_list = [
            {
                "paddock_id": paddock.paddock_id,
                "paddock_name": paddock.paddock_name
            }
            for paddock in paddocks
        ]
        
        return JSONResponse(
            content={
                "success": True,
                "paddocks": paddocks_list,
                "count": len(paddocks_list)
            },
            status_code=status.HTTP_200_OK
        )
    
    except Exception as e:
        return JSONResponse(
            content={
                "success": False,
                "message": "Failed to retrieve paddocks",
                "error": str(e)
            },
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
    
@router.get("/{paddock_id}", tags=["paddock"], description="Get details for a specific paddock.")
async def get_paddock(
    paddock_id: int,
    db: Session = Depends(get_db),
    current_user: db_models.user = Depends(get_current_user)
):
    """
    Retrieves detailed information about a paddock for the authenticated user.
    """
    try:
        paddock = db.query(db_models.paddock).filter(
            db_models.paddock.user_id == current_user.user_id,
            db_models.paddock.paddock_id == paddock_id
        ).first()

        if not paddock:
            return JSONResponse(
                content={
                    "success": False,
                    "message": "Paddock not found"
                },
                status_code=status.HTTP_404_NOT_FOUND
            )

        # Return paddock details
        paddock_data = {
            "paddock_id": paddock.paddock_id,
            "paddock_name": paddock.paddock_name,
            "user_id": paddock.user_id,
            "created_at": paddock.created_at.isoformat() if paddock.created_at else None, #created at field gives error
            # Add other fields if you have more info
        }

        return JSONResponse(
            content={
                "success": True,
                "paddock": paddock_data
            },
            status_code=status.HTTP_200_OK
        )

    except Exception as e:
        return JSONResponse(
            content={
                "success": False,
                "message": "Failed to retrieve paddock",
                "error": str(e)
            },
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@router.get("/{paddock_id}/devices", tags=["paddock"], description="Gets all devices for a paddock")
async def get_paddock_devices(
    paddock_id: int,
    db: Session = Depends(get_db),
    current_user: db_models.user = Depends(get_current_user)
):
    """
    Retrieves all devices belonging to a specific paddock
    for the authenticated user.
    """
    try:
        # Ensure paddock belongs to current user
        paddock = db.query(db_models.paddock).filter(
            db_models.paddock.user_id == current_user.user_id,
            db_models.paddock.paddock_id == paddock_id
        ).first()

        if not paddock:
            return JSONResponse(
                content={
                    "success": False,
                    "message": "Paddock not found"
                },
                status_code=status.HTTP_404_NOT_FOUND
            )

        # Get all devices linked to this paddock
        device_list = db.query(db_models.active_node).filter(
            db_models.active_node.paddock_id == paddock.paddock_id
        ).all()

        # If no devices found, return an empty list (not an error)
        if not device_list:
            return JSONResponse(
                content={
                    "success": True,
                    "devices": [],
                    "count": 0
                },
                status_code=status.HTTP_200_OK
            )

        # Convert SQLAlchemy objects to plain dicts
        devices_data = [
            {
                "node_id": device.node_id,
                "node_name": device.node_name
            }
            for device in device_list
        ]

        return JSONResponse(
            content={
                "success": True,
                "devices": devices_data
            },
            status_code=status.HTTP_200_OK
        )

    except Exception as e:
        return JSONResponse(
            content={
                "success": False,
                "message": "Failed to retrieve paddock devices",
                "error": str(e)
            },
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@router.get("/{paddock_id}/sensor-averages", tags=["paddock"], description="Get average sensor readings from all nodes in a paddock")
async def get_paddock_sensor_averages(
    paddock_id: int,
    db: Session = Depends(get_db),
    current_user: db_models.user = Depends(get_current_user)
):
    """
    Retrieves the most recent sensor readings from each node in a paddock
    and returns the average values for each sensor type (pH, temp, etc.).
    """
    try:
        # Verify paddock belongs to current user
        paddock = db.query(db_models.paddock).filter(
            db_models.paddock.user_id == current_user.user_id,
            db_models.paddock.paddock_id == paddock_id
        ).first()

        if not paddock:
            return JSONResponse(
                content={
                    "success": False,
                    "message": "Paddock not found"
                },
                status_code=status.HTTP_404_NOT_FOUND
            )

        # Get all nodes in this paddock
        nodes = db.query(db_models.active_node).filter(
            db_models.active_node.paddock_id == paddock_id
        ).all()

        if not nodes:
            return JSONResponse(
                content={
                    "success": True,
                    "message": "No nodes found in this paddock",
                    "paddock_id": paddock_id,
                    "paddock_name": paddock.paddock_name,
                    "nodes_count": 0,
                    "sensor_averages": {},
                },
                status_code=status.HTTP_200_OK
            )

        node_ids = [node.node_id for node in nodes]

        # Subquery to get the most recent capture_id for each node and reading_type combination
        latest_captures_query = db.query(
            db_models.reading.node_id,
            db_models.reading.reading_type,
            func.max(db_models.reading.capture_id).label('latest_capture_id')
        ).filter(
            db_models.reading.node_id.in_(node_ids)
        ).group_by(
            db_models.reading.node_id,
            db_models.reading.reading_type
        )
        
        latest_captures_results = latest_captures_query.all()
        
        latest_captures = latest_captures_query.subquery()

        # Get readings for the most recent capture of each sensor type per node
        recent_readings = db.query(
            db_models.reading.reading_type,
            db_models.reading.reading_val,
            db_models.reading.node_id,
            db_models.reading.capture_id
        ).join(
            latest_captures,
            (db_models.reading.node_id == latest_captures.c.node_id) &
            (db_models.reading.reading_type == latest_captures.c.reading_type) &
            (db_models.reading.capture_id == latest_captures.c.latest_capture_id)
        ).all()

        if not recent_readings:
            return JSONResponse(
                content={
                    "success": True,
                    "message": "No sensor readings found for nodes in this paddock",
                    "paddock_id": paddock_id,
                    "paddock_name": paddock.paddock_name,
                    "nodes_count": len(nodes),
                    "sensor_averages": {},
                },
                status_code=status.HTTP_200_OK
            )

        # Group readings by sensor type and calculate averages
        sensor_data = {}
        for reading_type, reading_value, node_id, capture_id in recent_readings:
            if reading_type not in sensor_data:
                sensor_data[reading_type] = []
            sensor_data[reading_type].append(reading_value)

        # Calculate averages for each sensor type
        sensor_averages = {}
        sensor_details = {}
        for reading_type, values in sensor_data.items():
            avg_value = sum(values) / len(values)
            sensor_averages[reading_type] = round(avg_value, 2)
            sensor_details[reading_type] = {
                "average": round(avg_value, 2),
                "min": round(min(values), 2),
                "max": round(max(values), 2),
                "count": len(values)  # Number of nodes that reported this sensor type
            }

        return JSONResponse(
            content={
                "success": True,
                "paddock_id": paddock_id,
                "paddock_name": paddock.paddock_name,
                "nodes_count": len(nodes),
                "nodes_with_readings": len(set(reading[2] for reading in recent_readings)),
                "sensor_averages": sensor_averages,
                "sensor_details": sensor_details,
            },
            status_code=status.HTTP_200_OK
        )

    except Exception as e:
        return JSONResponse(
            content={
                "success": False,
                "message": "Failed to retrieve sensor averages",
                "error": str(e)
            },
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@router.patch("/{paddock_id}", tags=["paddock"], description="Update a paddock's name.")
async def update_paddock(
    paddock_id: int,
    paddock_update: PaddockUpdate,
    db: Session = Depends(get_db),
    current_user: db_models.user = Depends(get_current_user)
):
    """
    Updates the name of a paddock for the authenticated user.
    """
    try:
        # Find the paddock and ensure it belongs to the current user
        paddock = db.query(db_models.paddock).filter(
            db_models.paddock.user_id == current_user.user_id,
            db_models.paddock.paddock_id == paddock_id
        ).first()

        if not paddock:
            return JSONResponse(
                content={
                    "success": False,
                    "message": "Paddock not found"
                },
                status_code=status.HTTP_404_NOT_FOUND
            )

        # Check if the new name already exists for this user (excluding current paddock)
        existing_paddock = db.query(db_models.paddock).filter(
            db_models.paddock.user_id == current_user.user_id,
            db_models.paddock.paddock_name == paddock_update.paddock_name,
            db_models.paddock.paddock_id != paddock_id
        ).first()

        if existing_paddock:
            return JSONResponse(
                content={
                    "success": False,
                    "message": f"A paddock named '{paddock_update.paddock_name}' already exists"
                },
                status_code=status.HTTP_409_CONFLICT
            )

        # Update the paddock name
        paddock.paddock_name = paddock_update.paddock_name
        db.commit()
        db.refresh(paddock)

        return JSONResponse(
            content={
                "success": True,
                "message": "Paddock updated successfully",
                "paddock": {
                    "paddock_id": paddock.paddock_id,
                    "paddock_name": paddock.paddock_name
                }
            },
            status_code=status.HTTP_200_OK
        )

    except Exception as e:
        db.rollback()
        return JSONResponse(
            content={
                "success": False,
                "message": "Failed to update paddock",
                "error": str(e)
            },
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@router.delete("/{paddock_id}", tags=["paddock"], description="Delete a paddock and unlink all devices.")
async def delete_paddock(
    paddock_id: int,
    db: Session = Depends(get_db),
    current_user: db_models.user = Depends(get_current_user)
):
    """
    Deletes a paddock and unlinks all associated devices by setting their
    paddock_id and user_id to NULL.
    """
    try:
        # Find the paddock and ensure it belongs to the current user
        paddock = db.query(db_models.paddock).filter(
            db_models.paddock.user_id == current_user.user_id,
            db_models.paddock.paddock_id == paddock_id
        ).first()

        if not paddock:
            return JSONResponse(
                content={
                    "success": False,
                    "message": "Paddock not found"
                },
                status_code=status.HTTP_404_NOT_FOUND
            )

        # Unlink all devices from this paddock
        db.query(db_models.active_node).filter(
            db_models.active_node.paddock_id == paddock_id
        ).update({
            "paddock_id": None,
            "user_id": None
        }, synchronize_session=False)

        # Delete the paddock
        db.delete(paddock)
        db.commit()

        return JSONResponse(
            content={
                "success": True,
                "message": "Paddock deleted successfully and all devices unlinked"
            },
            status_code=status.HTTP_200_OK
        )

    except Exception as e:
        db.rollback()
        return JSONResponse(
            content={
                "success": False,
                "message": "Failed to delete paddock",
                "error": str(e)
            },
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
        )