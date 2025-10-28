import React, {
  useState,
  useCallback,
  useContext,
  useEffect,
  useRef,
} from "react";
import { useParams, useHistory } from "react-router-dom";
import {
  Paper,
  Hidden,
  Box,
  Typography,
  CircularProgress,
  useTheme,
  alpha,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import {
  Chat as ChatIcon,
  ArrowLeft as ArrowLeftIcon,
  ArrowRight as ArrowRightIcon,
} from "@material-ui/icons";

import TicketsManager from "../../components/TicketsManagerTabs";
import Ticket from "../../components/Ticket";

import { QueueSelectedProvider } from "../../context/QueuesSelected/QueuesSelectedContext";
import { TicketsContext } from "../../context/Tickets/TicketsContext";
import { i18n } from "../../translate/i18n";
import { AuthContext } from "../../context/Auth/AuthContext";
import api from "../../services/api";
import { getBackendUrl } from "../../config";
import logo from "../../assets/logo.png";
import logoDark from "../../assets/logo-black.png";
import moment from "moment";

const defaultTicketsManagerWidth = 550;
const minTicketsManagerWidth = 404;
const maxTicketsManagerWidth = 700;

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexDirection: "column",
    height: "100%",
    position: "relative",
    backgroundColor: theme.palette.background.default,
  },
  chatContainer: {
    flex: 1,
    padding: theme.spacing(1, 0.5),
    height: `calc(100% - 48px)`,
    overflowY: "hidden",
  },
  chatWrapper: {
    display: "flex",
    height: "100%",
    borderRadius: 16,
    overflow: "hidden",
    boxShadow:
      theme.palette.mode === "dark"
        ? "0 4px 20px rgba(0,0,0,0.2)"
        : "0 4px 20px rgba(0,0,0,0.08)",
    border:
      theme.palette.mode === "dark"
        ? `1px solid ${alpha(theme.palette.divider, 0.1)}`
        : "none",
  },
  contactsWrapper: {
    display: "flex",
    height: "100%",
    flexDirection: "column",
    overflowY: "hidden",
    position: "relative",
    borderRight: `1px solid ${theme.palette.divider}`,
    backgroundColor: theme.palette.background.paper,
    transition: "width 0.3s ease-in-out",
  },
  messagesWrapper: {
    display: "flex",
    height: "100%",
    flexDirection: "column",
    flexGrow: 1,
    backgroundColor: theme.palette.background.paper,
  },
  welcomeContainer: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    height: "100%",
    padding: theme.spacing(4),
    backgroundColor: theme.palette.background.paper,
    textAlign: "center",
  },
  logoContainer: {
    marginBottom: theme.spacing(4),
    padding: theme.spacing(2),
    borderRadius: "50%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: alpha(theme.palette.primary.main, 0.04),
    width: 180,
    height: 180,
  },
  logo: {
    maxWidth: "100%",
    maxHeight: "100%",
    objectFit: "contain",
    filter: theme.palette.mode === "dark" ? "brightness(0.9)" : "none",
  },
  welcomeMessage: {
    fontSize: "1.1rem",
    color: theme.palette.text.secondary,
    maxWidth: "80%",
    lineHeight: 1.6,
  },
  welcomeIcon: {
    fontSize: 80,
    color: alpha(theme.palette.primary.main, 0.7),
    marginBottom: theme.spacing(3),
  },
  dragger: {
    width: "8px",
    cursor: "ew-resize",
    position: "absolute",
    top: 0,
    right: -4,
    bottom: 0,
    zIndex: 100,
    userSelect: "none",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    transition: "background-color 0.2s ease",
    "&:hover": {
      backgroundColor: alpha(theme.palette.primary.main, 0.1),
      "& $draggerHandle": {
        backgroundColor: theme.palette.primary.main,
        width: "4px",
      },
      "& $draggerIcon": {
        opacity: 0.8,
      },
    },
    "&:active": {
      backgroundColor: alpha(theme.palette.primary.main, 0.15),
      "& $draggerHandle": {
        backgroundColor: theme.palette.primary.main,
      },
    },
  },
  draggerHandle: {
    width: "2px",
    height: "40px",
    backgroundColor: theme.palette.divider,
    borderRadius: "4px",
    transition: "all 0.2s ease",
  },
  draggerIcon: {
    fontSize: 16,
    color: theme.palette.text.secondary,
    margin: theme.spacing(0.5, 0),
    opacity: 0.3,
    transition: "opacity 0.2s ease",
  },
  loadingContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
    width: "100%",
  },
}));

const TicketsCustom = () => {
  const { user } = useContext(AuthContext);
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const classes = useStyles();
  const { handleLogout } = useContext(AuthContext);
  const { ticketId } = useParams();
  const [loading, setLoading] = useState(false);

  const [ticketsManagerWidth, setTicketsManagerWidth] = useState(
    user?.defaultTicketsManagerWidth || defaultTicketsManagerWidth
  );
  const ticketsManagerWidthRef = useRef(ticketsManagerWidth);
  const isDragging = useRef(false);

  useEffect(() => {
    if (user && user.defaultTicketsManagerWidth) {
      setTicketsManagerWidth(user.defaultTicketsManagerWidth);
    }
  }, [user]);

  // Verificação da data de vencimento
  useEffect(() => {
    if (user && user.company) {
      const before = moment(moment().format()).isBefore(user.company.dueDate);
      if (!before) {
        handleLogout();
      }
    }
  }, [user, handleLogout]);

  // Determinar qual logo usar baseado no tema
  const logoSrc = (() => {
    // Verifica se há um logo customizado
    if (theme.calculatedLogoLight && theme.calculatedLogoDark) {
      return isDark ? theme.calculatedLogoDark() : theme.calculatedLogoLight();
    }
    // Caso contrário, usa o logo padrão
    return isDark ? logoDark : logo;
  })();

  const handleMouseDown = (e) => {
    e.preventDefault();
    isDragging.current = true;
    document.addEventListener("mouseup", handleMouseUp, true);
    document.addEventListener("mousemove", handleMouseMove, true);
  };

  const handleSaveContact = async (value) => {
    try {
      setLoading(true);
      if (value < minTicketsManagerWidth) value = minTicketsManagerWidth;
      if (value > maxTicketsManagerWidth) value = maxTicketsManagerWidth;

      await api.put(`/users/toggleChangeWidht/${user.id}`, {
        defaultTicketsManagerWidth: value,
      });
    } catch (error) {
      console.error("Error saving width preference:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleMouseMove = useCallback((e) => {
    if (!isDragging.current) return;

    const newWidth = e.clientX - document.body.offsetLeft;
    if (
      newWidth >= minTicketsManagerWidth &&
      newWidth <= maxTicketsManagerWidth
    ) {
      ticketsManagerWidthRef.current = newWidth;
      setTicketsManagerWidth(newWidth);
    }
  }, []);

  const handleMouseUp = async () => {
    if (!isDragging.current) return;

    isDragging.current = false;
    document.removeEventListener("mouseup", handleMouseUp, true);
    document.removeEventListener("mousemove", handleMouseMove, true);

    const newWidth = ticketsManagerWidthRef.current;
    if (newWidth !== ticketsManagerWidth) {
      await handleSaveContact(newWidth);
    }
  };

  return (
    <QueueSelectedProvider>
      <Box className={classes.root}>
        <Box className={classes.chatContainer}>
          <Box className={classes.chatWrapper}>
            <Box
              className={classes.contactsWrapper}
              style={{ width: ticketsManagerWidth }}
            >
              {loading ? (
                <Box className={classes.loadingContainer}>
                  <CircularProgress size={30} color="primary" />
                </Box>
              ) : (
                <TicketsManager />
              )}
              <Box className={classes.dragger} onMouseDown={handleMouseDown}>
                <ArrowLeftIcon className={classes.draggerIcon} />
                <Box className={classes.draggerHandle} />
                <ArrowRightIcon className={classes.draggerIcon} />
              </Box>
            </Box>

            <Box className={classes.messagesWrapper}>
              {ticketId ? (
                <Ticket />
              ) : (
                <Hidden only={["sm", "xs"]}>
                  <Box className={classes.welcomeContainer}>
                    <Box className={classes.logoContainer}>
                      {logoSrc ? (
                        <img
                          src={logoSrc}
                          alt="Logo"
                          className={classes.logo}
                        />
                      ) : (
                        <ChatIcon className={classes.welcomeIcon} />
                      )}
                    </Box>
                    <Typography className={classes.welcomeMessage}>
                      {i18n.t("chat.noTicketMessage")}
                    </Typography>
                  </Box>
                </Hidden>
              )}
            </Box>
          </Box>
        </Box>
      </Box>
    </QueueSelectedProvider>
  );
};

export default TicketsCustom;
