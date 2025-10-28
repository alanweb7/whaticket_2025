import React, { useState, useEffect, useContext } from "react";
import { useParams } from "react-router-dom";
import { makeStyles } from "@material-ui/core/styles";
import {
  Button,
  Box,
  Tabs,
  Tab,
  Paper,
  Typography,
  useTheme,
  alpha,
  Fade,
  CircularProgress,
} from "@material-ui/core";
import {
  Chat as ChatIcon,
  QuestionAnswer as QuestionAnswerIcon,
  Headset as HeadsetIcon,
} from "@material-ui/icons";

import TicketsManagerTabs from "../../components/TicketsManagerTabs";
import Ticket from "../../components/Ticket";
import TicketAdvancedLayout from "../../components/TicketAdvancedLayout";

import { TicketsContext } from "../../context/Tickets/TicketsContext";
import { i18n } from "../../translate/i18n";
import { QueueSelectedProvider } from "../../context/QueuesSelected/QueuesSelectedContext";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexDirection: "column",
    height: "100%",
    backgroundColor: theme.palette.background.default,
  },
  header: {
    backgroundColor: theme.palette.background.paper,
    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
    zIndex: 10,
    position: "relative",
  },
  tabsRoot: {
    minHeight: "48px",
    backgroundColor: theme.palette.background.paper,
    borderRadius: "8px 8px 0 0",
    overflow: "hidden",
    "& .MuiTab-root": {
      minHeight: "48px",
      textTransform: "none",
      fontWeight: 500,
      fontSize: "0.875rem",
      transition: "all 0.2s ease",
      "&.Mui-selected": {
        backgroundColor: alpha(theme.palette.primary.main, 0.08),
        color: theme.palette.primary.main,
      },
      "&:hover": {
        backgroundColor: alpha(theme.palette.primary.main, 0.04),
      },
    },
    "& .MuiTabs-indicator": {
      height: "3px",
      borderRadius: "3px 3px 0 0",
    },
  },
  tabPanel: {
    padding: 0,
    height: "100%",
  },
  content: {
    flex: 1,
    overflow: "auto",
    position: "relative",
  },
  placeholderContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
    backgroundColor: theme.palette.background.paper,
    padding: theme.spacing(3),
    textAlign: "center",
  },
  placeholderIcon: {
    fontSize: 80,
    color: alpha(theme.palette.primary.main, 0.7),
    marginBottom: theme.spacing(3),
  },
  placeholderTitle: {
    fontWeight: 600,
    marginBottom: theme.spacing(2),
    color: theme.palette.text.primary,
  },
  placeholderText: {
    color: theme.palette.text.secondary,
    marginBottom: theme.spacing(3),
    maxWidth: "60%",
  },
  actionButton: {
    borderRadius: "8px",
    padding: theme.spacing(1, 3),
    textTransform: "none",
    fontWeight: 500,
    boxShadow: "none",
    "&:hover": {
      boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
    },
  },
  loadingContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: alpha(theme.palette.background.paper, 0.7),
    zIndex: 5,
  },
  tabIcon: {
    marginRight: theme.spacing(1),
  },
}));

// Tab Panel componente para melhor organização do conteúdo
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`ticket-tabpanel-${index}`}
      aria-labelledby={`ticket-tab-${index}`}
      style={{ height: "100%" }}
      {...other}
    >
      {value === index && <Box height="100%">{children}</Box>}
    </div>
  );
}

const TicketAdvanced = () => {
  const classes = useStyles();
  const { ticketId } = useParams();
  const [option, setOption] = useState(0);
  const [loading, setLoading] = useState(false);
  const { currentTicket, setCurrentTicket } = useContext(TicketsContext);
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  useEffect(() => {
    if (currentTicket.id !== null) {
      setCurrentTicket({ id: currentTicket.id, code: "#open" });
    }
    if (!ticketId) {
      setOption(1);
    }
    return () => {
      setCurrentTicket({ id: null, code: null });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (currentTicket.id !== null) {
      setOption(0);
    }
  }, [currentTicket]);

  const handleChange = (event, newValue) => {
    setLoading(true);
    setOption(newValue);
    // Simula um pequeno delay para uma transição mais suave
    setTimeout(() => {
      setLoading(false);
    }, 300);
  };

  const renderPlaceholder = () => {
    return (
      <Box className={classes.placeholderContainer}>
        <HeadsetIcon className={classes.placeholderIcon} />
        <Typography variant="h5" className={classes.placeholderTitle}>
          {i18n.t("chat.noTicketTitle") || "Nenhum ticket selecionado"}
        </Typography>
        <Typography variant="body1" className={classes.placeholderText}>
          {i18n.t("chat.noTicketMessage")}
        </Typography>
        <Button
          onClick={() => setOption(1)}
          variant="contained"
          color="primary"
          className={classes.actionButton}
          startIcon={<QuestionAnswerIcon />}
        >
          {i18n.t("chat.selectTicket") || "Selecionar Ticket"}
        </Button>
      </Box>
    );
  };

  const renderMessageContext = () => {
    if (ticketId && ticketId !== "undefined") {
      return <Ticket />;
    }
    return renderPlaceholder();
  };

  const renderTicketsManagerTabs = () => {
    return <TicketsManagerTabs />;
  };

  return (
    <QueueSelectedProvider>
      <TicketAdvancedLayout>
        <Box className={classes.root}>
          <Paper elevation={0} className={classes.header}>
            <Tabs
              value={option}
              onChange={handleChange}
              className={classes.tabsRoot}
              variant="fullWidth"
              indicatorColor="primary"
              textColor="primary"
            >
              <Tab
                icon={<ChatIcon className={classes.tabIcon} />}
                label={i18n.t("ticketAdvanced.ticketTab") || "Ticket"}
                id="ticket-tab-0"
                aria-controls="ticket-tabpanel-0"
              />
              <Tab
                icon={<QuestionAnswerIcon className={classes.tabIcon} />}
                label={i18n.t("ticketAdvanced.attendanceTab") || "Atendimentos"}
                id="ticket-tab-1"
                aria-controls="ticket-tabpanel-1"
              />
            </Tabs>
          </Paper>

          <Box className={classes.content}>
            {loading && (
              <Fade in={loading}>
                <Box className={classes.loadingContainer}>
                  <CircularProgress size={40} color="primary" />
                </Box>
              </Fade>
            )}

            <TabPanel value={option} index={0} className={classes.tabPanel}>
              {renderMessageContext()}
            </TabPanel>

            <TabPanel value={option} index={1} className={classes.tabPanel}>
              {renderTicketsManagerTabs()}
            </TabPanel>
          </Box>
        </Box>
      </TicketAdvancedLayout>
    </QueueSelectedProvider>
  );
};

export default TicketAdvanced;
