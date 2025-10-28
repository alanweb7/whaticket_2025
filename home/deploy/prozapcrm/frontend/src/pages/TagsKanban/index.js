import React, {
  useState,
  useEffect,
  useReducer,
  useCallback,
  useContext,
} from "react";
import { useHistory } from "react-router-dom";
import { toast } from "react-toastify";

// Material-UI components
import {
  makeStyles,
  Paper,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  IconButton,
  TextField,
  InputAdornment,
  Chip,
  Typography,
  Box,
  Fade,
  Tooltip,
  Divider,
  Card,
  CardContent,
  Badge,
  alpha,
  Grid,
} from "@material-ui/core";

// Material-UI icons
import {
  Search as SearchIcon,
  DeleteOutline as DeleteOutlineIcon,
  Edit as EditIcon,
  Add as AddIcon,
  ArrowBack as ArrowBackIcon,
  DragHandle as DragHandleIcon,
  Dashboard as DashboardIcon,
  Label as LabelIcon,
} from "@material-ui/icons";

// Components
import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import Title from "../../components/Title";
import TableRowSkeleton from "../../components/TableRowSkeleton";
import TagModal from "../../components/TagModal";
import ConfirmationModal from "../../components/ConfirmationModal";

// Services and utilities
import api from "../../services/api";
import { i18n } from "../../translate/i18n";
import toastError from "../../errors/toastError";
import { AuthContext } from "../../context/Auth/AuthContext";

const reducer = (state, action) => {
  if (action.type === "LOAD_TAGS") {
    const tags = action.payload;
    const newTags = [];

    tags.forEach((tag) => {
      const tagIndex = state.findIndex((s) => s.id === tag.id);
      if (tagIndex !== -1) {
        state[tagIndex] = tag;
      } else {
        newTags.push(tag);
      }
    });

    return [...state, ...newTags];
  }

  if (action.type === "UPDATE_TAGS") {
    const tag = action.payload;
    const tagIndex = state.findIndex((s) => s.id === tag.id);

    if (tagIndex !== -1) {
      state[tagIndex] = tag;
      return [...state];
    } else {
      return [tag, ...state];
    }
  }

  if (action.type === "DELETE_TAGS") {
    const tagId = action.payload;
    return state.filter((tag) => tag.id !== tagId);
  }

  if (action.type === "RESET") {
    return [];
  }
};

const useStyles = makeStyles((theme) => ({
  mainPaper: {
    flex: 1,
    padding: theme.spacing(2),
    overflowY: "scroll",
    ...theme.scrollbarStyles,
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)",
    borderRadius: 10,
  },
  searchContainer: {
    display: "flex",
    alignItems: "center",
    marginBottom: theme.spacing(2),
    width: "100%",
  },
  searchInput: {
    flex: 1,
    marginRight: theme.spacing(2),
    "& .MuiOutlinedInput-root": {
      borderRadius: 50,
      "& fieldset": {
        borderColor: alpha(theme.palette.primary.main, 0.2),
      },
      "&:hover fieldset": {
        borderColor: alpha(theme.palette.primary.main, 0.5),
      },
      "&.Mui-focused fieldset": {
        borderColor: theme.palette.primary.main,
      },
    },
  },
  button: {
    borderRadius: 30,
    padding: theme.spacing(1, 3),
    marginLeft: theme.spacing(1),
    boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
    "& .MuiButton-startIcon": {
      marginRight: theme.spacing(0.5),
    },
  },
  customTableCell: {
    borderBottom: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
  },
  customTableRow: {
    transition: "background-color 0.2s ease",
    "&:hover": {
      backgroundColor: alpha(theme.palette.primary.main, 0.05),
    },
  },
  tableContainer: {
    marginTop: theme.spacing(2),
    borderRadius: 10,
    overflow: "hidden",
    boxShadow: "0 2px 15px rgba(0, 0, 0, 0.02)",
    border: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
  },
  tableHead: {
    backgroundColor: alpha(theme.palette.primary.main, 0.05),
    "& .MuiTableCell-head": {
      color: theme.palette.text.secondary,
      fontWeight: 600,
      fontSize: "0.875rem",
      border: "none",
      padding: theme.spacing(1.5, 2),
    },
  },
  tagChip: {
    padding: theme.spacing(1, 2),
    height: 36,
    fontWeight: 600,
    fontSize: "0.875rem",
    textShadow: "1px 1px 2px rgba(0, 0, 0, 0.3)",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
    minWidth: 120,
    justifyContent: "center",
  },
  actionButton: {
    margin: theme.spacing(0, 0.5),
    backgroundColor: "white",
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
    "&:hover": {
      backgroundColor: alpha(theme.palette.background.paper, 0.9),
    },
  },
  iconEdit: {
    color: theme.palette.primary.main,
  },
  iconDelete: {
    color: theme.palette.error.main,
  },
  countBadge: {
    backgroundColor: alpha(theme.palette.primary.main, 0.1),
    color: theme.palette.primary.main,
    fontWeight: "bold",
    borderRadius: 20,
    padding: theme.spacing(0.5, 1.5),
    fontSize: "0.8rem",
    display: "inline-flex",
    alignItems: "center",
    boxShadow: `0 0 0 1px ${alpha(theme.palette.primary.main, 0.2)}`,
  },
  emptyState: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: theme.spacing(6),
    textAlign: "center",
    color: theme.palette.text.secondary,
    borderRadius: 10,
    backgroundColor: alpha(theme.palette.background.default, 0.5),
    border: `1px dashed ${alpha(theme.palette.divider, 0.8)}`,
    "& svg": {
      fontSize: 60,
      color: alpha(theme.palette.primary.main, 0.2),
      marginBottom: theme.spacing(3),
    },
  },
  titleContainer: {
    display: "flex",
    alignItems: "center",
    "& svg": {
      marginRight: theme.spacing(1),
      color: theme.palette.primary.main,
    },
  },
  searchIcon: {
    color: theme.palette.primary.main,
  },
}));

const KanbanTags = () => {
  const classes = useStyles();
  const history = useHistory();
  const { user, socket } = useContext(AuthContext);

  const [loading, setLoading] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [selectedTag, setSelectedTag] = useState(null);
  const [deletingTag, setDeletingTag] = useState(null);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [searchParam, setSearchParam] = useState("");
  const [tags, dispatch] = useReducer(reducer, []);
  const [tagModalOpen, setTagModalOpen] = useState(false);

  const fetchTags = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/tags/", {
        params: { searchParam, pageNumber, kanban: 1 },
      });
      dispatch({ type: "LOAD_TAGS", payload: data.tags });
      setHasMore(data.hasMore);
      setLoading(false);
    } catch (err) {
      toastError(err);
      setLoading(false);
    }
  }, [searchParam, pageNumber]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchTags();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchParam, pageNumber, fetchTags]);

  useEffect(() => {
    dispatch({ type: "RESET" });
    setPageNumber(1);
  }, [searchParam]);

  useEffect(() => {
    const onTagsEvent = (data) => {
      if (data.action === "update" || data.action === "create") {
        dispatch({ type: "UPDATE_TAGS", payload: data.tag });
      }

      if (data.action === "delete") {
        dispatch({ type: "DELETE_TAGS", payload: +data.tagId });
      }
    };

    socket.on(`company${user.companyId}-tag`, onTagsEvent);

    return () => {
      socket.off(`company${user.companyId}-tag`, onTagsEvent);
    };
  }, [socket, user.companyId]);

  const handleOpenTagModal = () => {
    setSelectedTag(null);
    setTagModalOpen(true);
  };

  const handleCloseTagModal = () => {
    setSelectedTag(null);
    setTagModalOpen(false);
  };

  const handleSearch = (event) => {
    setSearchParam(event.target.value.toLowerCase());
  };

  const handleEditTag = (tag) => {
    setSelectedTag(tag);
    setTagModalOpen(true);
  };

  const handleDeleteTag = async (tagId) => {
    try {
      await api.delete(`/tags/${tagId}`);
      toast.success(i18n.t("tags.toasts.deleted"));
    } catch (err) {
      toastError(err);
    }
    setDeletingTag(null);
    setSearchParam("");
    setPageNumber(1);
  };

  const loadMore = () => {
    setPageNumber((prevState) => prevState + 1);
  };

  const handleScroll = (e) => {
    if (!hasMore || loading) return;
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - (scrollTop + 100) < clientHeight) {
      loadMore();
    }
  };

  const handleReturnToKanban = () => {
    history.push("/kanban");
  };

  return (
    <MainContainer>
      <ConfirmationModal
        title={
          deletingTag && i18n.t("tagsKanban.confirmationModal.deleteTitle")
        }
        open={confirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        onConfirm={() => handleDeleteTag(deletingTag.id)}
      >
        <Typography>
          {i18n.t("tagsKanban.confirmationModal.deleteMessage")}
        </Typography>
        <Box mt={2} display="flex" justifyContent="center">
          <Chip
            label={deletingTag?.name}
            style={{
              backgroundColor: deletingTag?.color,
              color: "white",
              textShadow: "1px 1px 1px #000",
            }}
          />
        </Box>
      </ConfirmationModal>

      {tagModalOpen && (
        <TagModal
          open={tagModalOpen}
          onClose={handleCloseTagModal}
          aria-labelledby="form-dialog-title"
          tagId={selectedTag && selectedTag.id}
          kanban={1}
        />
      )}

      <MainHeader>
        <Box className={classes.titleContainer}>
          <DashboardIcon />
          <Title>
            {i18n.t("tagsKanban.title")}
            <Badge
              badgeContent={tags.length}
              color="primary"
              showZero
              style={{ marginLeft: 10 }}
            />
          </Title>
        </Box>
        <MainHeaderButtonsWrapper>
          <Box className={classes.searchContainer}>
            <TextField
              className={classes.searchInput}
              placeholder={i18n.t("contacts.searchPlaceholder")}
              type="search"
              value={searchParam}
              onChange={handleSearch}
              variant="outlined"
              size="small"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon className={classes.searchIcon} />
                  </InputAdornment>
                ),
              }}
            />
            <Tooltip title={i18n.t("tagsKanban.buttons.add")} arrow>
              <Button
                variant="contained"
                color="primary"
                onClick={handleOpenTagModal}
                className={classes.button}
                startIcon={<AddIcon />}
              >
                {i18n.t("tagsKanban.buttons.add")}
              </Button>
            </Tooltip>
            <Tooltip title={i18n.t("tagsKanban.buttons.back")} arrow>
              <Button
                variant="outlined"
                color="primary"
                onClick={handleReturnToKanban}
                className={classes.button}
                startIcon={<ArrowBackIcon />}
              >
                {i18n.t("tagsKanban.buttons.back")}
              </Button>
            </Tooltip>
          </Box>
        </MainHeaderButtonsWrapper>
      </MainHeader>

      <Paper
        className={classes.mainPaper}
        variant="outlined"
        onScroll={handleScroll}
      >
        {tags.length === 0 && !loading ? (
          <Fade in={tags.length === 0 && !loading}>
            <Box className={classes.emptyState}>
              <LabelIcon fontSize="large" />
              <Typography variant="h6" gutterBottom>
                {i18n.t("tagsKanban.emptyState.title")}
              </Typography>
              <Typography variant="body2" paragraph>
                {i18n.t("tagsKanban.emptyState.message")}
              </Typography>
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={handleOpenTagModal}
                className={classes.button}
              >
                {i18n.t("tagsKanban.buttons.add")}
              </Button>
            </Box>
          </Fade>
        ) : (
          <Box className={classes.tableContainer}>
            <Table size="small">
              <TableHead className={classes.tableHead}>
                <TableRow>
                  <TableCell align="center">
                    {i18n.t("tagsKanban.table.name")}
                  </TableCell>
                  <TableCell align="center">
                    {i18n.t("tagsKanban.table.tickets")}
                  </TableCell>
                  <TableCell align="center">
                    {i18n.t("tagsKanban.table.actions")}
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {tags.map((tag) => (
                  <TableRow key={tag.id} className={classes.customTableRow}>
                    <TableCell
                      align="center"
                      className={classes.customTableCell}
                    >
                      <Chip
                        label={tag.name}
                        className={classes.tagChip}
                        style={{
                          backgroundColor: tag.color,
                          color: "white",
                        }}
                      />
                    </TableCell>
                    <TableCell
                      align="center"
                      className={classes.customTableCell}
                    >
                      <Box className={classes.countBadge}>
                        <DragHandleIcon
                          fontSize="small"
                          style={{ marginRight: 4 }}
                        />
                        {tag?.ticketTags?.length || 0}
                      </Box>
                    </TableCell>
                    <TableCell
                      align="center"
                      className={classes.customTableCell}
                    >
                      <Tooltip title={i18n.t("tagsKanban.buttons.edit")} arrow>
                        <IconButton
                          size="small"
                          onClick={() => handleEditTag(tag)}
                          className={classes.actionButton}
                        >
                          <EditIcon
                            fontSize="small"
                            className={classes.iconEdit}
                          />
                        </IconButton>
                      </Tooltip>

                      <Tooltip
                        title={i18n.t("tagsKanban.buttons.delete")}
                        arrow
                      >
                        <IconButton
                          size="small"
                          onClick={() => {
                            setConfirmModalOpen(true);
                            setDeletingTag(tag);
                          }}
                          className={classes.actionButton}
                        >
                          <DeleteOutlineIcon
                            fontSize="small"
                            className={classes.iconDelete}
                          />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
                {loading && <TableRowSkeleton columns={3} />}
              </TableBody>
            </Table>
          </Box>
        )}
      </Paper>
    </MainContainer>
  );
};

export default KanbanTags;
