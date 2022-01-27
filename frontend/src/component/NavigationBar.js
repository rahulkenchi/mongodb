import React from 'react'
import { Navbar, Nav, Container } from 'react-bootstrap'
import { NavLink } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'
export default function NavigationBar() {
    const navigate = useNavigate()
    return (
        <Navbar bg="light" expand="lg" className="mb-3">
            <Container>
                <Navbar.Brand>Invoicing.com</Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="me-auto">
                        <Nav.Link><NavLink to="login">Login</NavLink></Nav.Link>
                        <Nav.Link><NavLink to="/signup">Signup</NavLink></Nav.Link>
                        <Nav.Link> <NavLink to="/">Home</NavLink></Nav.Link>
                        <Nav.Link><NavLink to="/invoice">Invoice</NavLink></Nav.Link>
                        <Nav.Link><NavLink to="/settings">Settings</NavLink></Nav.Link>
                        <Nav.Link onClick={() => { sessionStorage.removeItem('user'); navigate("/login") }}>Logout</Nav.Link>
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    )
}
