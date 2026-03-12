import React, {useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {Container, Row, Col, Card, Button} from 'react-bootstrap';
import axios from 'axios';

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({livros: 0, alunos: 0, emprestimos: 0});

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:3001/dashboard/stats', {
          headers: {Authorization: `Bearer ${token}`},
        });
        setStats(res.data);
      } catch (err) {
        console.error('Erro ao carregar dashboard', err);
      }
    };
    fetchStats();
  }, []);

  return (
    <Container className="mt-4">
      <h2 className="mb-4">Dashboard - Biblioteca Hilda</h2>
      <Row>
        {/* Card de Livros */}
        <Col md={4} className="mb-3">
          <Card className="text-white bg-primary shadow border-0">
            <Card.Body>
              <Card.Title>Total de Livros</Card.Title>
              <h1 className="display-4">{stats.livros}</h1>
              <Button
                variant="outline-light"
                size="sm"
                onClick={() => navigate('/acervo')}>
                Ver Acervo
              </Button>
            </Card.Body>
          </Card>
        </Col>

        {/* Card de Alunos */}
        <Col md={4} className="mb-3">
          <Card className="text-white bg-success shadow border-0">
            <Card.Body>
              <Card.Title>Alunos Cadastrados</Card.Title>
              <h1 className="display-4">{stats.alunos}</h1>
              <Button
                variant="outline-light"
                size="sm"
                onClick={() => (window.location.href = '/usuarios')}>
                Gerenciar Alunos
              </Button>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="text-center shadow-sm border-0 bg-primary text-white">
            <Card.Body>
              <Card.Title>Novo Empréstimo</Card.Title>
              <Card.Text style={{fontSize: '2rem'}}>
                <i className="bi bi-journal-plus"></i>
              </Card.Text>
              <Button
                variant="light"
                onClick={() => navigate('/novo-emprestimo')}>
                Registrar Saída
              </Button>
            </Card.Body>
          </Card>
        </Col>

        {/* Card de Empréstimos */}
        <Col md={4} className="mb-3">
          <Card className="text-white bg-warning shadow border-0">
            <Card.Body>
              <Card.Title>Empréstimos Ativos</Card.Title>
              <h1 className="display-4">{stats.emprestimos}</h1>
              <Button variant="outline-light" size="sm" className="text-dark">
                Ver Prazos
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Sugestão: Espaço para a Busca (Em Análise) */}
      <Row className="mt-5">
        <Col>
          <Card className="p-4 border-dashed">
            <h5 className="text-muted">Busca Rápida de Livros</h5>
            <p className="small">
              Dica: Use o ISBN para encontrar livros instantaneamente via Google
              Books.
            </p>
            {/* Aqui entrará o seu componente de busca no futuro */}
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Dashboard;
