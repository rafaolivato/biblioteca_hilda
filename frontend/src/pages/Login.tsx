import React, { useState } from 'react';
import { Container, Form, Button, Card, Alert } from 'react-bootstrap';
import axios from 'axios';

const Login = () => {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');

    try {
      // Ajuste a porta se o seu backend estiver em outra (ex: 3001)
      const response = await axios.post('http://localhost:3001/auth/login', {
        email,
        senha
      });

      // Salva o token para usar nas próximas requisições
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('usuario', JSON.stringify(response.data.usuario));

      alert(`Bem-vindo, ${response.data.usuario.nome}!`);
      window.location.href = '/dashboard'; // Redirecionamento simples
    } catch (err: any) {
      setErro(err.response?.data?.message || 'Erro ao conectar com o servidor');
    }
  };

  return (
    <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: "100vh" }}>
      <Card style={{ width: '100%', maxWidth: '400px' }} className="shadow-lg border-0">
        <Card.Body className="p-5">
          <h2 className="text-center mb-4 fw-bold text-primary">Biblioteca Hilda</h2>
          <p className="text-center text-muted mb-4">Entre com suas credenciais</p>
          
          {erro && <Alert variant="danger">{erro}</Alert>}

          <Form onSubmit={handleLogin}>
            <Form.Group className="mb-3">
              <Form.Label>E-mail</Form.Label>
              <Form.Control 
                type="email" 
                placeholder="admin@biblioteca.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
              />
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label>Senha</Form.Label>
              <Form.Control 
                type="password" 
                placeholder="******"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                required 
              />
            </Form.Group>

            <Button variant="primary" type="submit" className="w-100 py-2 fw-bold">
              Entrar
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Login;