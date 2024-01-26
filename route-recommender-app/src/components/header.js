import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import '../styles/header.css'; 

function Header()
{

    return (
      <Navbar collapseOnSelect expand="lg" bg="light" className="navbar-link">
        <Container>
          <Navbar.Brand href="/">Route Recommender</Navbar.Brand>
          <Navbar.Toggle aria-controls="responsive-navbar-nav" />
          <Navbar.Collapse id="responsive-navbar-nav">
            <Nav className="me-auto">
                 <Nav.Link href="about" style={{fontSize: 18}}>About</Nav.Link>
                 <Nav.Link href="recommender" style={{fontSize: 18}}>Try it!</Nav.Link>
            </Nav>
            <Nav>
              <Nav.Link href="contact" style={{fontSize: 18}}>Contact Us</Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    );
}

export default Header;