from sqlalchemy import Column, String, Float, Integer, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from db.init import Base
from sqlalchemy import func


class capture(Base):
    __tablename__ = 'capture'
    capture_id = Column(Integer, primary_key=True, autoincrement=True)
    timestamp = Column(DateTime, nullable=False)
    resp_time = Column(Float)
    
    # Relationships
    active_nodes = relationship("active_node", back_populates="capture")
    batteries = relationship("battery", back_populates="capture")
    readings = relationship("reading", back_populates="capture")
    notifications = relationship("notification", back_populates="capture")

class user(Base):
    __tablename__ = 'user'
    user_id = Column(String(45), primary_key=True)
    first_name = Column(String(45))
    last_name = Column(String(45))
    password = Column(String(255))
    
    # Relationships
    paddocks = relationship("paddock", back_populates="user")
    active_nodes = relationship("active_node", back_populates="user")

class paddock(Base):
    __tablename__ = 'paddock'
    paddock_id = Column(Integer, autoincrement=True, unique=True)
    paddock_name = Column(String(45), primary_key=True, nullable=False)
    user_id = Column(String(45), ForeignKey('user.user_id'), primary_key=True, nullable=False)
    
    # Relationships
    user = relationship("user", back_populates="paddocks")
    active_nodes = relationship("active_node", back_populates="paddock")

class active_node(Base):
    __tablename__ = 'active_node'
    node_id = Column(String(6), primary_key=True)
    node_name = Column(String(45), nullable=False)
    capture_id = Column(Integer, ForeignKey('capture.capture_id'))
    gps = Column(String(30))
    paddock_id = Column(Integer, ForeignKey('paddock.paddock_id'))
    user_id = Column(String(45), ForeignKey('user.user_id'))
    
    # Relationships
    capture = relationship("capture", back_populates="active_nodes")
    paddock = relationship("paddock", back_populates="active_nodes")
    user = relationship("user", back_populates="active_nodes")
    batteries = relationship("battery", back_populates="active_node")
    readings = relationship("reading", back_populates="active_node")
    notifications = relationship("notification", back_populates="active_node")

class battery(Base):
    __tablename__ = 'battery'
    capture_id = Column(Integer, ForeignKey('capture.capture_id'), primary_key=True)
    node_id = Column(String(6), ForeignKey('active_node.node_id'), primary_key=True)
    bat_lvl = Column(Float, nullable=False)
    bat_hlth = Column(Float)
    
    # Relationships
    capture = relationship("capture", back_populates="batteries")
    active_node = relationship("active_node", back_populates="batteries")

class reading(Base):
    __tablename__ = 'reading'
    capture_id = Column(Integer, ForeignKey('capture.capture_id'), primary_key=True)
    node_id = Column(String(6), ForeignKey('active_node.node_id'), primary_key=True)
    reading_type = Column(String(12), nullable=False)
    reading_val = Column(Float, nullable=False)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())

    
    # Relationships
    capture = relationship("capture", back_populates="readings")
    active_node = relationship("active_node", back_populates="readings")

class notification(Base):
    __tablename__ = 'notification'
    node_id = Column(String(6), ForeignKey('active_node.node_id'), primary_key=True)
    capture_id = Column(Integer, ForeignKey('capture.capture_id'), primary_key=True)
    notif_code = Column(Integer)
    
    # Relationships
    capture = relationship("capture", back_populates="notifications")
    active_node = relationship("active_node", back_populates="notifications")