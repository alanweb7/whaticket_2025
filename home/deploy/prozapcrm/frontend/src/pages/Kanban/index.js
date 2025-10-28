import React, { useState, useEffect, useContext } from "react";
import { makeStyles, useTheme } from "@material-ui/core/styles";
import api from "../../services/api";
import { AuthContext } from "../../context/Auth/AuthContext";
import Board from "react-trello";
import { toast } from "react-toastify";
import { i18n } from "../../translate/i18n";
import { useHistory } from "react-router-dom";
import {
  Facebook,
  Instagram,
  WhatsApp,
  Search,
  Add,
  Today,
  Event,
} from "@material-ui/icons";
import {
  Badge,
  Tooltip,
  Typography,
  Button,
  TextField,
  Box,
  Paper,
  InputAdornment,
  Chip,
  Avatar,
} from "@material-ui/core";
import { format, isSameDay, parseISO } from "date-fns";
import { Can } from "../../components/Can";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: theme.spacing(3),
    backgroundColor: theme.palette.background.default,
    minHeight: "100vh",
  },
  header: {
    width: "100%",
    maxWidth: "1400px",
    marginBottom: theme.spacing(3),
    padding: theme.spacing(3),
    borderRadius: theme.spacing(2),
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[3],
  },
  filterSection: {
    display: "flex",
    alignItems: "center",
    flexWrap: "wrap",
    gap: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
  kanbanContainer: {
    width: "100%",
    maxWidth: "1400px",
    margin: "0 auto",
    borderRadius: theme.spacing(2),
    overflow: "hidden",
  },
  connectionTag: {
    background: "linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)",
    color: "#FFF",
    padding: theme.spacing(0.5, 1),
    fontWeight: "bold",
    borderRadius: 12,
    fontSize: "0.7em",
  },
  lastMessageTime: {
    textAlign: "right",
    color: theme.palette.text.secondary,
    fontSize: "0.8em",
    marginLeft: "auto",
  },
  lastMessageTimeUnread: {
    textAlign: "right",
    color: theme.palette.success.main,
    fontWeight: "bold",
    fontSize: "0.8em",
    marginLeft: "auto",
  },
  cardButton: {
    marginTop: theme.spacing(1),
    background: theme.palette.primary.main,
    color: theme.palette.common.white,
    borderRadius: 20,
    padding: theme.spacing(0.5, 2),
    textTransform: "none",
    fontWeight: 500,
    "&:hover": {
      background: theme.palette.primary.dark,
      transform: "translateY(-1px)",
      boxShadow: theme.shadows[2],
    },
  },
  dateField: {
    "& .MuiOutlinedInput-root": {
      borderRadius: 12,
      backgroundColor: theme.palette.background.default,
    },
  },
  searchButton: {
    borderRadius: 12,
    padding: theme.spacing(1, 2),
    textTransform: "none",
    fontWeight: 600,
  },
  addButton: {
    borderRadius: 12,
    padding: theme.spacing(1, 2),
    textTransform: "none",
    fontWeight: 600,
  },
  card: {
    borderRadius: 12,
    marginBottom: theme.spacing(1),
    border: `1px solid ${theme.palette.divider}`,
    transition: "all 0.2s ease-in-out",
    "&:hover": {
      transform: "translateY(-2px)",
      boxShadow: theme.shadows[4],
    },
  },
  cardContent: {
    padding: theme.spacing(1.5),
  },
  contactName: {
    fontWeight: 600,
    fontSize: "0.95rem",
    marginBottom: theme.spacing(0.5),
  },
  contactNumber: {
    color: theme.palette.text.secondary,
    fontSize: "0.85rem",
  },
  lastMessage: {
    fontSize: "0.9rem",
    lineHeight: 1.3,
    margin: theme.spacing(1, 0),
    color: theme.palette.text.primary,
  },
  laneHeader: {
    padding: theme.spacing(2),
    borderRadius: "12px 12px 0 0",
    color: "white !important",
    fontWeight: 600,
  },
  laneCounter: {
    backgroundColor: "rgba(255, 255, 255, 0.2) !important",
    color: "white !important",
    fontWeight: 600,
  },
}));

const Kanban = () => {
  const classes = useStyles();
  const theme = useTheme();
  const history = useHistory();
  const { user, socket } = useContext(AuthContext);
  const [tags, setTags] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [file, setFile] = useState({ lanes: [] });
  const [startDate, setStartDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [endDate, setEndDate] = useState(format(new Date(), "yyyy-MM-dd"));

  const jsonString = user.queues.map((queue) => queue.UserQueue.queueId);

  useEffect(() => {
    fetchTags();
  }, [user]);

  const fetchTags = async () => {
    try {
      const response = await api.get("/tag/kanban/");
      const fetchedTags = response.data.lista || [];
      setTags(fetchedTags);
      fetchTickets();
    } catch (error) {
      console.log(error);
    }
  };

  const fetchTickets = async () => {
    try {
      const { data } = await api.get("/ticket/kanban", {
        params: {
          queueIds: JSON.stringify(jsonString),
          startDate: startDate,
          endDate: endDate,
        },
      });
      setTickets(data.tickets);
    } catch (err) {
      console.log(err);
      setTickets([]);
    }
  };

  useEffect(() => {
    const companyId = user.companyId;
    const onAppMessage = (data) => {
      if (
        data.action === "create" ||
        data.action === "update" ||
        data.action === "delete"
      ) {
        fetchTickets();
      }
    };
    socket.on(`company-${companyId}-ticket`, onAppMessage);
    socket.on(`company-${companyId}-appMessage`, onAppMessage);

    return () => {
      socket.off(`company-${companyId}-ticket`, onAppMessage);
      socket.off(`company-${companyId}-appMessage`, onAppMessage);
    };
  }, [socket, startDate, endDate]);

  const handleSearchClick = () => {
    fetchTickets();
  };

  const handleStartDateChange = (event) => {
    setStartDate(event.target.value);
  };

  const handleEndDateChange = (event) => {
    setEndDate(event.target.value);
  };

  const IconChannel = (channel) => {
    switch (channel) {
      case "facebook":
        return <Facebook style={{ color: "#3b5998", fontSize: "18px" }} />;
      case "instagram":
        return <Instagram style={{ color: "#e1306c", fontSize: "18px" }} />;
      case "whatsapp":
        return <WhatsApp style={{ color: "#25d366", fontSize: "18px" }} />;
      default:
        return "error";
    }
  };

  const popularCards = (jsonString) => {
    const filteredTickets = tickets.filter(
      (ticket) => ticket.tags.length === 0
    );

    const lanes = [
      {
        id: "lane0",
        title: i18n.t("tagsKanban.laneDefault"),
        label: filteredTickets.length.toString(),
        style: {
          backgroundColor: theme.palette.background.paper,
          borderRadius: 12,
        },
        cardStyle: {
          borderRadius: 12,
          marginBottom: theme.spacing(1),
        },
        cards: filteredTickets.map((ticket) => ({
          id: ticket.id.toString(),
          label: "Ticket nº " + ticket.id.toString(),
          description: (
            <div className={classes.cardContent}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: 8,
                }}
              >
                <Chip
                  size="small"
                  label={ticket.contact.number}
                  className={classes.contactNumber}
                  variant="outlined"
                />
                <Typography
                  className={
                    Number(ticket.unreadMessages) > 0
                      ? classes.lastMessageTimeUnread
                      : classes.lastMessageTime
                  }
                  component="span"
                  variant="body2"
                >
                  {isSameDay(parseISO(ticket.updatedAt), new Date()) ? (
                    <>{format(parseISO(ticket.updatedAt), "HH:mm")}</>
                  ) : (
                    <>{format(parseISO(ticket.updatedAt), "dd/MM/yyyy")}</>
                  )}
                </Typography>
              </div>

              <Typography className={classes.lastMessage}>
                {ticket.lastMessage || " "}
              </Typography>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginTop: 12,
                }}
              >
                <Button
                  className={classes.cardButton}
                  onClick={() => handleCardClick(ticket.uuid)}
                  size="small"
                >
                  Ver Ticket
                </Button>

                {ticket?.user && (
                  <Chip
                    avatar={
                      <Avatar>
                        {ticket.user?.name.charAt(0).toUpperCase()}
                      </Avatar>
                    }
                    label={ticket.user?.name}
                    size="small"
                    className={classes.connectionTag}
                  />
                )}
              </div>
            </div>
          ),
          title: (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Tooltip title={ticket.whatsapp?.name}>
                {IconChannel(ticket.channel)}
              </Tooltip>
              <span className={classes.contactName}>{ticket.contact.name}</span>
            </div>
          ),
          draggable: true,
          metadata: { ticket },
        })),
      },
      ...tags.map((tag) => {
        const filteredTickets = tickets.filter((ticket) => {
          const tagIds = ticket.tags.map((tag) => tag.id);
          return tagIds.includes(tag.id);
        });

        return {
          id: tag.id.toString(),
          title: tag.name,
          label: filteredTickets?.length.toString(),
          style: {
            backgroundColor: tag.color,
            borderRadius: 12,
          },
          cardStyle: {
            borderRadius: 12,
            marginBottom: theme.spacing(1),
          },
          cards: filteredTickets.map((ticket) => ({
            id: ticket.id.toString(),
            label: "Ticket nº " + ticket.id.toString(),
            description: (
              <div className={classes.cardContent}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: 8,
                  }}
                >
                  <Chip
                    size="small"
                    label={ticket.contact.number}
                    className={classes.contactNumber}
                    variant="outlined"
                  />
                  <Typography
                    className={
                      Number(ticket.unreadMessages) > 0
                        ? classes.lastMessageTimeUnread
                        : classes.lastMessageTime
                    }
                    component="span"
                    variant="body2"
                  >
                    {isSameDay(parseISO(ticket.updatedAt), new Date()) ? (
                      <>{format(parseISO(ticket.updatedAt), "HH:mm")}</>
                    ) : (
                      <>{format(parseISO(ticket.updatedAt), "dd/MM/yyyy")}</>
                    )}
                  </Typography>
                </div>

                <Typography className={classes.lastMessage}>
                  {ticket.lastMessage || " "}
                </Typography>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginTop: 12,
                  }}
                >
                  <Button
                    className={classes.cardButton}
                    onClick={() => handleCardClick(ticket.uuid)}
                    size="small"
                  >
                    Ver Ticket
                  </Button>

                  {ticket?.user && (
                    <Chip
                      avatar={
                        <Avatar>
                          {ticket.user?.name.charAt(0).toUpperCase()}
                        </Avatar>
                      }
                      label={ticket.user?.name}
                      size="small"
                      className={classes.connectionTag}
                    />
                  )}
                </div>
              </div>
            ),
            title: (
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Tooltip title={ticket.whatsapp?.name}>
                  {IconChannel(ticket.channel)}
                </Tooltip>
                <span className={classes.contactName}>
                  {ticket.contact.name}
                </span>
              </div>
            ),
            draggable: true,
            metadata: { ticket },
          })),
        };
      }),
    ];

    setFile({ lanes });
  };

  const handleCardClick = (uuid) => {
    history.push("/tickets/" + uuid);
  };

  useEffect(() => {
    popularCards(jsonString);
  }, [tags, tickets]);

  const handleCardMove = async (cardId, sourceLaneId, targetLaneId) => {
    try {
      await api.delete(`/ticket-tags/${targetLaneId}`);
      toast.success("Ticket Tag Removido!");
      await api.put(`/ticket-tags/${targetLaneId}/${sourceLaneId}`);
      toast.success("Ticket Tag Adicionado com Sucesso!");
      await fetchTickets(jsonString);
      popularCards(jsonString);
    } catch (err) {
      console.log(err);
    }
  };

  const handleAddConnectionClick = () => {
    history.push("/tagsKanban");
  };

  return (
    <div className={classes.root}>
      <Paper className={classes.header} elevation={0}>
        <div className={classes.filterSection}>
          <TextField
            label="Data de início"
            type="date"
            value={startDate}
            onChange={handleStartDateChange}
            InputLabelProps={{ shrink: true }}
            variant="outlined"
            className={classes.dateField}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Today color="action" />
                </InputAdornment>
              ),
            }}
          />

          <TextField
            label="Data de fim"
            type="date"
            value={endDate}
            onChange={handleEndDateChange}
            InputLabelProps={{ shrink: true }}
            variant="outlined"
            className={classes.dateField}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Event color="action" />
                </InputAdornment>
              ),
            }}
          />

          <Button
            variant="contained"
            color="primary"
            onClick={handleSearchClick}
            className={classes.searchButton}
            startIcon={<Search />}
          >
            Buscar
          </Button>

          <Box sx={{ flexGrow: 1 }} />

          <Can
            role={user.profile}
            perform="dashboard:view"
            yes={() => (
              <Button
                variant="contained"
                onClick={handleAddConnectionClick}
                className={classes.addButton}
                startIcon={<Add />}
              >
                Adicionar colunas
              </Button>
            )}
          />
        </div>

        <Typography variant="h6" color="textPrimary" gutterBottom>
          Quadro Kanban de Tickets
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Organize e gerencie seus tickets através das colunas personalizadas
        </Typography>
      </Paper>

      <div className={classes.kanbanContainer}>
        <Board
          data={file}
          onCardMoveAcrossLanes={handleCardMove}
          style={{
            backgroundColor: theme.palette.background.default,
            padding: theme.spacing(1),
          }}
          cardStyle={{ borderRadius: 12 }}
          laneStyle={{ borderRadius: 12 }}
        />
      </div>
    </div>
  );
};

export default Kanban;
