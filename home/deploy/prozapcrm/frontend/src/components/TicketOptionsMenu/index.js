import React, { useContext, useEffect, useRef, useState } from "react";
import { useHistory } from "react-router-dom";

import { makeStyles, alpha } from "@material-ui/core/styles";
import {
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Switch,
  Typography,
  Divider,
  Box,
  CircularProgress,
  Fade,
} from "@material-ui/core";
import {
  Close as CloseIcon,
  Delete as DeleteIcon,
  Schedule as ScheduleIcon,
  Transfer as TransferIcon,
  MicOff as MicOffIcon,
  Mic as MicIcon,
  Chat as ChatIcon,
} from "@material-ui/icons";

import { i18n } from "../../translate/i18n";
import api from "../../services/api";
import ConfirmationModal from "../ConfirmationModal";
import TransferTicketModalCustom from "../TransferTicketModalCustom";
import toastError from "../../errors/toastError";
import { Can } from "../Can";
import { AuthContext } from "../../context/Auth/AuthContext";
import ScheduleModal from "../ScheduleModal";

const useStyles = makeStyles((theme) => ({
  menu: {
    "& .MuiPaper-root": {
      borderRadius: 8,
      boxShadow: "0 3px 15px rgba(0,0,0,0.1)",
      border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
      padding: theme.spacing(1, 0),
    },
  },
  menuItem: {
    padding: theme.spacing(1.5, 2),
    transition: "background-color 0.2s ease",
    "&:hover": {
      backgroundColor: alpha(theme.palette.primary.main, 0.08),
    },
  },
  menuItemDanger: {
    color: theme.palette.error.main,
    "&:hover": {
      backgroundColor: alpha(theme.palette.error.main, 0.08),
    },
    "& .MuiListItemIcon-root": {
      color: theme.palette.error.main,
    },
  },
  menuItemSuccess: {
    color: theme.palette.success.main,
    "&:hover": {
      backgroundColor: alpha(theme.palette.success.main, 0.08),
    },
    "& .MuiListItemIcon-root": {
      color: theme.palette.success.main,
    },
  },
  icon: {
    minWidth: 36,
    color: theme.palette.text.secondary,
  },
  divider: {
    margin: theme.spacing(1, 0),
  },
  switchItem: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  switchWrapper: {
    marginLeft: theme.spacing(1),
  },
  loadingWrapper: {
    display: "flex",
    alignItems: "center",
    marginLeft: theme.spacing(1),
  },
  categoryLabel: {
    fontSize: "0.7rem",
    textTransform: "uppercase",
    color: theme.palette.text.secondary,
    letterSpacing: "0.05em",
    fontWeight: 500,
    padding: theme.spacing(1, 2, 0.5),
  },
}));

const TicketOptionsMenu = ({ ticket, menuOpen, handleClose, anchorEl }) => {
  const classes = useStyles();
  const history = useHistory();

  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [transferTicketModalOpen, setTransferTicketModalOpen] = useState(false);
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [contactId, setContactId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [audioToggleLoading, setAudioToggleLoading] = useState(false);
  const [acceptAudioMessage, setAcceptAudio] = useState(
    ticket.contact.acceptAudioMessage
  );

  const isMounted = useRef(true);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  const handleDeleteTicket = async () => {
    try {
      setLoading(true);
      await api.delete(`/tickets/${ticket.id}`);
      if (isMounted.current) {
        setLoading(false);
        history.push("/tickets");
      }
    } catch (err) {
      if (isMounted.current) {
        setLoading(false);
        toastError(err);
      }
    }
  };

  const handleOpenConfirmationModal = () => {
    setConfirmationOpen(true);
    handleClose();
  };

  const handleOpenTransferModal = () => {
    setTransferTicketModalOpen(true);
    handleClose();
  };

  const handleCloseTransferTicketModal = () => {
    if (isMounted.current) {
      setTransferTicketModalOpen(false);
    }
  };

  const handleCloseTicketWithoutFarewellMsg = async () => {
    setLoading(true);
    try {
      await api.put(`/tickets/${ticket.id}`, {
        status: "closed",
        userId: user?.id || null,
        sendFarewellMessage: false,
      });

      if (isMounted.current) {
        setLoading(false);
        history.push("/tickets");
      }
    } catch (err) {
      if (isMounted.current) {
        setLoading(false);
        toastError(err);
      }
    }
  };

  const handleContactToggleAcceptAudio = async () => {
    setAudioToggleLoading(true);
    try {
      const contact = await api.put(
        `/contacts/toggleAcceptAudio/${ticket.contact.id}`
      );
      if (isMounted.current) {
        setAcceptAudio(contact.data.acceptAudioMessage);
        setAudioToggleLoading(false);
      }
    } catch (err) {
      if (isMounted.current) {
        setAudioToggleLoading(false);
        toastError(err);
      }
    }
  };

  const handleOpenScheduleModal = () => {
    handleClose();
    setContactId(ticket.contact.id);
    setScheduleModalOpen(true);
  };

  const handleCloseScheduleModal = () => {
    setScheduleModalOpen(false);
    setContactId(null);
  };

  return (
    <>
      <Menu
        id="ticket-options-menu"
        anchorEl={anchorEl}
        getContentAnchorEl={null}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        keepMounted
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        open={menuOpen}
        onClose={handleClose}
        className={classes.menu}
        TransitionComponent={Fade}
      >
        <Typography className={classes.categoryLabel}>
          {i18n.t("ticketOptionsMenu.actions")}
        </Typography>

        <MenuItem
          onClick={handleCloseTicketWithoutFarewellMsg}
          className={`${classes.menuItem} ${classes.menuItemSuccess}`}
          disabled={loading}
        >
          <ListItemIcon className={classes.icon}>
            <CloseIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText
            primary={i18n.t("ticketOptionsMenu.resolveWithNoFarewell")}
          />
          {loading && (
            <Box className={classes.loadingWrapper}>
              <CircularProgress size={20} />
            </Box>
          )}
        </MenuItem>

        <MenuItem
          onClick={handleOpenScheduleModal}
          className={classes.menuItem}
        >
          <ListItemIcon className={classes.icon}>
            <ScheduleIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary={i18n.t("ticketOptionsMenu.schedule")} />
        </MenuItem>

        <MenuItem
          onClick={handleOpenTransferModal}
          className={classes.menuItem}
        >
          <ListItemIcon className={classes.icon}>
            <TransferIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary={i18n.t("ticketOptionsMenu.transfer")} />
        </MenuItem>

        <Divider className={classes.divider} />

        <Typography className={classes.categoryLabel}>
          {i18n.t("ticketOptionsMenu.settings")}
        </Typography>

        <MenuItem className={`${classes.menuItem} ${classes.switchItem}`}>
          <Box display="flex" alignItems="center">
            <ListItemIcon className={classes.icon}>
              {acceptAudioMessage ? (
                <MicIcon fontSize="small" />
              ) : (
                <MicOffIcon fontSize="small" />
              )}
            </ListItemIcon>
            <ListItemText
              primary={i18n.t("ticketOptionsMenu.acceptAudioMessage")}
            />
          </Box>
          <Box className={classes.switchWrapper}>
            {audioToggleLoading ? (
              <CircularProgress size={24} />
            ) : (
              <Switch
                size="small"
                checked={acceptAudioMessage}
                onChange={handleContactToggleAcceptAudio}
                name="acceptAudioMessage"
                color="primary"
              />
            )}
          </Box>
        </MenuItem>

        <Can
          role={user.profile}
          perform="ticket-options:deleteTicket"
          yes={() => (
            <>
              <Divider className={classes.divider} />
              <Typography className={classes.categoryLabel}>
                {i18n.t("ticketOptionsMenu.dangerZone")}
              </Typography>
              <MenuItem
                onClick={handleOpenConfirmationModal}
                className={`${classes.menuItem} ${classes.menuItemDanger}`}
              >
                <ListItemIcon className={classes.icon}>
                  <DeleteIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText primary={i18n.t("ticketOptionsMenu.delete")} />
              </MenuItem>
            </>
          )}
        />
      </Menu>

      <ConfirmationModal
        title={`${i18n.t("ticketOptionsMenu.confirmationModal.title")} ${
          ticket.contact.name
        }?`}
        open={confirmationOpen}
        onClose={() => setConfirmationOpen(false)}
        onConfirm={handleDeleteTicket}
      >
        {i18n.t("ticketOptionsMenu.confirmationModal.message")}
      </ConfirmationModal>

      <TransferTicketModalCustom
        modalOpen={transferTicketModalOpen}
        onClose={handleCloseTransferTicketModal}
        ticketid={ticket.id}
      />

      <ScheduleModal
        open={scheduleModalOpen}
        onClose={handleCloseScheduleModal}
        aria-labelledby="form-dialog-title"
        contactId={contactId}
      />
    </>
  );
};

export default TicketOptionsMenu;
