import { useState, useEffect } from "react";
import { Table, Button, Modal, Form, Spinner } from "react-bootstrap";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const API_URL = "https://jsonplaceholder.typicode.com/users";

function App() {
  const [students, setStudents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentStudentId, setCurrentStudentId] = useState(null);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    contact: "",
    email: "",
    doesWork: false,
    group: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchStudents = async () => {
      setLoading(true);
      try {
        const response = await fetch(API_URL);
        const data = await response.json();
        const formattedData = data.map((student) => ({
          id: student.id,
          firstName: student.name.split(" ")[0],
          lastName: student.name.split(" ")[1] || "",
          contact: student.phone,
          email: student.email,
          doesWork: student.company?.name ? true : false,
          group: "",
        }));
        setStudents(formattedData);
      } catch (error) {
        console.error("Failed to fetch students:", error);
        toast.error("Failed to fetch students");
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    if (isEditing) {
      try {
        const response = await fetch(`${API_URL}/${currentStudentId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });
        if (!response.ok) {
          throw new Error("Failed to update student");
        }
        setStudents(
          students.map((student) =>
            student.id === currentStudentId
              ? { ...formData, id: currentStudentId }
              : student
          )
        );
        toast.success("Contact updated successfully");
        setIsEditing(false);
        setCurrentStudentId(null);
      } catch (error) {
        console.error("Failed to update student:", error);
        toast.error("Failed to update student");
      }
    } else {
      try {
        const response = await fetch(API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });
        if (!response.ok) {
          throw new Error("Failed to add student");
        }
        const newStudent = await response.json();
        setStudents([...students, { ...formData, id: newStudent.id }]);
        toast.success("Contact added successfully");
      } catch (error) {
        console.error("Failed to add student:", error);
        toast.error("Failed to add student");
      }
    }
    setShowModal(false);
    setFormData({
      firstName: "",
      lastName: "",
      contact: "",
      email: "",
    });
    setLoading(false);
  };

  const openModal = () => setShowModal(true);
  const closeModal = () => {
    setShowModal(false);
    setIsEditing(false);
    setCurrentStudentId(null);
    setFormData({
      firstName: "",
      lastName: "",
      contact: "",
      email: "",
    });
  };

  const handleEdit = (student) => {
    setFormData({
      firstName: student.firstName,
      lastName: student.lastName,
      contact: student.contact,
      email: student.email,
    });
    setCurrentStudentId(student.id);
    setIsEditing(true);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Failed to delete student");
      }
      setStudents(students.filter((student) => student.id !== id));
      toast.error("Contact deleted successfully");
    } catch (error) {
      console.error("Failed to delete student:", error);
      toast.error("Failed to delete student");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="Main">
      <div className="container">
        <Button variant="primary" className="primary" onClick={openModal}>
          Todo List
        </Button>
        <Table striped bordered hover className="mt-4">
          <thead>
            <tr className="table">
              <th>First Name</th>
              <th>Last Name</th>
              <th>Email</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => (
              <tr key={student.id}>
                <td>{student.firstName}</td>
                <td>{student.lastName}</td>
                <td>{student.email}</td>
                <td className="tds">
                  <Button
                    className="buton"
                    variant="warning"
                    onClick={() => handleEdit(student)}
                  >
                    Edit
                  </Button>{" "}
                  <Button
                    className="buton"
                    variant="danger"
                    onClick={() => handleDelete(student.id)}
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>

        <Modal show={showModal} onHide={closeModal}>
          <Modal.Header closeButton>
            <Modal.Title>
              {isEditing ? "Edit Student" : "Todo List"}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form onSubmit={handleFormSubmit}>
              <Form.Group className="mb-3" controlId="formFirstName">
                <Form.Label>First Name</Form.Label>
                <Form.Control
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3" controlId="formLastName">
                <Form.Label>Last Name</Form.Label>
                <Form.Control
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3" controlId="formEmail">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  placeholder="example@example.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </Form.Group>
              <Button variant="primary" type="submit" disabled={loading}>
                {loading ? (
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                  />
                ) : isEditing ? (
                  "Update Student"
                ) : (
                  "Add Student"
                )}
              </Button>
            </Form>
          </Modal.Body>
        </Modal>
        <ToastContainer />
      </div>
    </div>
  );
}

export default App;
