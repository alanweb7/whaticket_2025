import React from "react";
import { useParams } from "react-router-dom";
import {
  Box,
  Grid,
  Paper,
  Typography,
  useTheme,
  alpha,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { getBackendUrl } from "../../config";
import TicketsManager from "../../components/TicketsManager";
import Ticket from "../../components/Ticket";
import { i18n } from "../../translate/i18n";
import logo from "../../assets/logo.png";
import logoDark from "../../assets/logo-black.png";
import { Chat as ChatIcon } from "@material-ui/icons";

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
    height: `calc(100vh - 64px)`,
    padding: theme.spacing(2),
    overflow: "hidden",
    position: "relative",
    [theme.breakpoints.down("sm")]: {
      padding: theme.spacing(1),
      height: `calc(100vh - 56px)`,
    },
  },
  chatWrapper: {
    display: "flex",
    flexDirection: "row",
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
    borderRight: `1px solid ${theme.palette.divider}`,
    backgroundColor: theme.palette.background.paper,
    width: "100%",
    overflowY: "hidden",
    transition: "all 0.3s ease",
  },
  messagesWrapper: {
    display: "flex",
    height: "100%",
    flexDirection: "column",
    backgroundColor: theme.palette.background.paper,
    width: "100%",
    position: "relative",
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
    borderRadius: 0,
    border: "none",
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
  placeholderIcon: {
    fontSize: 80,
    color: alpha(theme.palette.primary.main, 0.7),
  },
  welcomeMessage: {
    fontSize: "1.1rem",
    color: theme.palette.text.secondary,
    maxWidth: "80%",
    lineHeight: 1.6,
  },
  welcomeTitle: {
    marginBottom: theme.spacing(2),
    fontWeight: 600,
    color: theme.palette.text.primary,
  },
  animatedPulse: {
    animation: "$pulse 2s infinite",
  },
  "@keyframes pulse": {
    "0%": {
      transform: "scale(1)",
      opacity: 1,
    },
    "50%": {
      transform: "scale(1.05)",
      opacity: 0.8,
    },
    "100%": {
      transform: "scale(1)",
      opacity: 1,
    },
  },
}));

const Chat = () => {
  const classes = useStyles();
  const { ticketId } = useParams();
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  // Determine qual logo usar baseado no tema
  const logoSrc = (() => {
    // Verifica se há um logo customizado
    if (theme.appLogoLight || theme.appLogoDark) {
      const logoPath = isDark
        ? theme.appLogoDark || theme.appLogoLight
        : theme.appLogoLight || theme.appLogoDark;
      return `${getBackendUrl()}/public/${logoPath}`;
    }
    // Caso contrário, usa o logo padrão
    return isDark ? logoDark : logo;
  })();

  return (
    <Box className={classes.root}>
      <Box className={classes.chatContainer}>
        <Box className={classes.chatWrapper}>
          <Grid container spacing={0}>
            <Grid
              item
              xs={12}
              sm={4}
              md={4}
              lg={3}
              className={classes.contactsWrapper}
            >
              <TicketsManager />
            </Grid>
            <Grid
              item
              xs={12}
              sm={8}
              md={8}
              lg={9}
              className={classes.messagesWrapper}
            >
              {ticketId ? (
                <Ticket />
              ) : (
                <Paper elevation={0} className={classes.welcomeContainer}>
                  <Box className={classes.logoContainer}>
                    {logoSrc ? (
                      <img src={logoSrc} alt="Logo" className={classes.logo} />
                    ) : (
                      <ChatIcon
                        className={`${classes.placeholderIcon} ${classes.animatedPulse}`}
                      />
                    )}
                  </Box>
                  <Typography variant="h4" className={classes.welcomeTitle}>
                    {i18n.t("chat.welcomeTitle") || "Bem-vindo ao Chat"}
                  </Typography>
                  <Typography className={classes.welcomeMessage}>
                    {i18n.t("chat.noTicketMessage")}
                  </Typography>
                </Paper>
              )}
            </Grid>
          </Grid>
        </Box>
      </Box>
    </Box>
  );
};

export default Chat;
