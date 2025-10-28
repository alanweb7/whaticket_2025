import React, { useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { format, isSameDay, parseISO } from "date-fns";
import clsx from "clsx";

// Material-UI components
import {
  makeStyles,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Badge,
  Typography,
  Box,
  Chip,
  alpha,
  Tooltip,
} from "@material-ui/core";
import { green } from "@material-ui/core/colors";
import CheckCircleIcon from "@material-ui/icons/CheckCircle";
import AccessTimeIcon from "@material-ui/icons/AccessTime";

// Components
import MarkdownWrapper from "../MarkdownWrapper";

const useStyles = makeStyles((theme) => ({
  ticketItem: {
    position: "relative",
    borderRadius: theme.shape.borderRadius,
    padding: theme.spacing(1.5, 2),
    marginBottom: theme.spacing(0.5),
    transition: "all 0.2s ease",
    "&:hover": {
      backgroundColor: alpha(theme.palette.primary.main, 0.04),
    },
  },
  pendingTicket: {
    cursor: "not-allowed",
    opacity: 0.7,
    backgroundColor: alpha(theme.palette.text.disabled, 0.05),
    "&:hover": {
      backgroundColor: alpha(theme.palette.text.disabled, 0.05),
    },
  },
  selectedTicket: {
    backgroundColor: alpha(theme.palette.primary.main, 0.1),
    borderLeft: `4px solid ${theme.palette.primary.main}`,
    "&:hover": {
      backgroundColor: alpha(theme.palette.primary.main, 0.15),
    },
  },
  avatar: {
    width: 48,
    height: 48,
    boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
    border: `2px solid ${alpha(theme.palette.primary.main, 0.2)}`,
  },
  selectedAvatar: {
    border: `2px solid ${theme.palette.primary.main}`,
  },
  contactHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: theme.spacing(0.5),
  },
  contactName: {
    fontWeight: 500,
    fontSize: "0.95rem",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    maxWidth: "70%",
  },
  selectedText: {
    color: theme.palette.primary.main,
    fontWeight: 600,
  },
  lastMessageTime: {
    fontSize: "0.75rem",
    color: theme.palette.text.secondary,
    display: "flex",
    alignItems: "center",
    "& svg": {
      fontSize: "0.9rem",
      marginRight: theme.spacing(0.5),
    },
  },
  messagePreview: {
    display: "flex",
    alignItems: "center",
    color: theme.palette.text.secondary,
    fontSize: "0.85rem",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    maxWidth: "85%",
  },
  unreadBadge: {
    marginLeft: "auto",
    color: "#fff",
    backgroundColor: green[500],
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
  },
  statusChip: {
    height: 24,
    marginLeft: theme.spacing(1),
    fontSize: "0.7rem",
    fontWeight: 500,
  },
  closedChip: {
    backgroundColor: alpha(theme.palette.grey[500], 0.1),
    color: theme.palette.text.secondary,
    "& .MuiChip-avatar": {
      color: theme.palette.grey[500],
    },
  },
  statusSection: {
    display: "flex",
    alignItems: "center",
  },
  noTicketsContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: theme.spacing(4),
    textAlign: "center",
  },
  noTicketsTitle: {
    fontSize: "1rem",
    fontWeight: 600,
    marginBottom: theme.spacing(1),
  },
  noTicketsText: {
    color: theme.palette.text.secondary,
    fontSize: "0.9rem",
    lineHeight: 1.5,
  },
}));

const TicketListForwardMessageItem = ({ ticket, selectedTicket, sendData }) => {
  const classes = useStyles();
  const { ticketId } = useParams();
  const isMounted = useRef(true);

  const isSelected = ticket === selectedTicket;
  const isPending = ticket.status === "closed";
  const isCurrentTicket = ticketId && +ticketId === ticket.id;

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  const handleSelectTicket = () => {
    if (ticket.status === "pending") return;
    sendData(ticket);
  };

  const formatLastMessageTime = (updatedAt) => {
    if (!updatedAt) return "";

    if (isSameDay(parseISO(updatedAt), new Date())) {
      return format(parseISO(updatedAt), "HH:mm");
    } else {
      return format(parseISO(updatedAt), "dd/MM/yyyy");
    }
  };

  return (
    <ListItem
      button
      onClick={handleSelectTicket}
      className={clsx(classes.ticketItem, {
        [classes.pendingTicket]: ticket.status === "pending",
        [classes.selectedTicket]: isSelected || isCurrentTicket,
      })}
      disabled={ticket.status === "pending"}
    >
      <ListItemAvatar>
        <Avatar
          src={ticket.contact.urlPicture}
          alt={ticket.contact.name}
          className={clsx(classes.avatar, {
            [classes.selectedAvatar]: isSelected || isCurrentTicket,
          })}
        />
      </ListItemAvatar>

      <ListItemText
        disableTypography
        primary={
          <Box className={classes.contactHeader}>
            <Tooltip title={ticket.contact.name} arrow placement="top">
              <Typography
                component="span"
                variant="body2"
                className={clsx(classes.contactName, {
                  [classes.selectedText]: isSelected || isCurrentTicket,
                })}
              >
                {ticket.contact.name}
              </Typography>
            </Tooltip>

            <Box className={classes.statusSection}>
              {ticket.status === "closed" && (
                <Chip
                  size="small"
                  label={ticket.status}
                  className={clsx(classes.statusChip, classes.closedChip)}
                  avatar={<CheckCircleIcon />}
                />
              )}

              {ticket.lastMessage && (
                <Typography
                  component="span"
                  variant="caption"
                  className={classes.lastMessageTime}
                >
                  <AccessTimeIcon />
                  {formatLastMessageTime(ticket.updatedAt)}
                </Typography>
              )}
            </Box>
          </Box>
        }
        secondary={
          <Box display="flex" alignItems="center" mt={0.5}>
            <Typography
              component="span"
              variant="body2"
              className={classes.messagePreview}
            >
              {ticket.lastMessage ? (
                <MarkdownWrapper>{ticket.lastMessage}</MarkdownWrapper>
              ) : (
                <Typography
                  variant="caption"
                  color="textSecondary"
                  style={{ fontStyle: "italic" }}
                >
                  Nenhuma mensagem
                </Typography>
              )}
            </Typography>

            {ticket.unreadMessages > 0 && (
              <Badge
                badgeContent={ticket.unreadMessages}
                classes={{ badge: classes.unreadBadge }}
                max={99}
              />
            )}
          </Box>
        }
      />
    </ListItem>
  );
};

export default TicketListForwardMessageItem;
