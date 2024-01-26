import Spinner from 'react-bootstrap/Spinner';

function SpinnerComponent() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
        </Spinner>
    </div>
  );
}

export default SpinnerComponent;