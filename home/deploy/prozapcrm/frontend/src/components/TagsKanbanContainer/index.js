import React, { useEffect, useState, useCallback } from "react";
import {
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Box,
  CircularProgress,
  Tooltip,
  alpha,
  makeStyles,
} from "@material-ui/core";
import {
  Dashboard as DashboardIcon,
  ArrowDropDown as ArrowDropDownIcon,
  Add as AddIcon,
} from "@material-ui/icons";
import { i18n } from "../../translate/i18n";
import api from "../../services/api";
import toastError from "../../errors/toastError";

const useStyles = makeStyles((theme) => ({
  formControl: {
    margin: theme.spacing(1, 0),
    minWidth: 120,
    position: "relative",
  },
  selectEmpty: {
    marginTop: theme.spacing(2),
  },
  select: {
    padding: theme.spacing(1.2, 1),
    borderRadius: theme.shape.borderRadius,
    "&:focus": {
      borderRadius: theme.shape.borderRadius,
    },
    "&:before, &:after": {
      display: "none",
    },
  },
  selectIcon: {
    color: theme.palette.primary.main,
  },
  chip: {
    height: 28,
    borderRadius: 4,
    fontWeight: 500,
    fontSize: "0.8rem",
    padding: theme.spacing(0, 0.5),
    color: "#FFF",
    boxShadow: "0 1px 3px rgba(0,0,0,0.12)",
    display: "flex",
    alignItems: "center",
    "&:hover": {
      opacity: 0.9,
    },
  },
  emptyChip: {
    height: 28,
    backgroundColor: alpha(theme.palette.primary.main, 0.1),
    color: theme.palette.primary.main,
    display: "flex",
    alignItems: "center",
    fontSize: "0.8rem",
    padding: theme.spacing(0, 1),
    borderRadius: 4,
    fontWeight: 500,
    border: `1px dashed ${alpha(theme.palette.primary.main, 0.4)}`,
    "& svg": {
      fontSize: 16,
      marginRight: theme.spacing(0.5),
    },
  },
  selectMenu: {
    padding: theme.spacing(1),
    borderRadius: theme.shape.borderRadius,
  },
  menuItem: {
    margin: theme.spacing(0.5, 0),
    minHeight: 36,
    borderRadius: theme.shape.borderRadius,
    fontSize: "0.9rem",
    fontWeight: 400,
    "&:hover": {
      backgroundColor: alpha(theme.palette.primary.main, 0.1),
    },
    "&.Mui-selected": {
      backgroundColor: alpha(theme.palette.primary.main, 0.15),
      "&:hover": {
        backgroundColor: alpha(theme.palette.primary.main, 0.2),
      },
    },
  },
  label: {
    backgroundColor: theme.palette.background.paper,
    fontSize: "0.9rem",
    transform: "translate(14px, -6px) scale(0.75)",
    color: theme.palette.primary.main,
    fontWeight: 500,
  },
  loading: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: theme.spacing(2),
  },
  iconContainer: {
    marginRight: theme.spacing(0.5),
    display: "flex",
    alignItems: "center",
  },
  icon: {
    fontSize: 16,
  },
  menuHeader: {
    padding: theme.spacing(1),
    color: theme.palette.text.secondary,
    fontSize: "0.75rem",
    borderBottom: `1px solid ${theme.palette.divider}`,
    marginBottom: theme.spacing(0.5),
    fontWeight: 500,
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  emptyItem: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-start",
    fontSize: "0.85rem",
    color: theme.palette.text.secondary,
    padding: theme.spacing(1, 2),
  },
  colorIndicator: {
    width: 12,
    height: 12,
    borderRadius: 2,
    marginRight: theme.spacing(1),
    boxShadow: "0 1px 2px rgba(0,0,0,0.2)",
  },
}));

export function TagsKanbanContainer({ ticket }) {
  const classes = useStyles();
  const [tags, setTags] = useState([]);
  const [selected, setSelected] = useState("");
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const loadTags = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/tags/list`, { params: { kanban: 1 } });
      setTags(data);
      setLoading(false);
    } catch (err) {
      toastError(err);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    const initializeComponent = async () => {
      await loadTags();
      if (isMounted && ticket.tags && ticket.tags.length > 0) {
        setSelected(ticket.tags[0].id);
      }
    };

    initializeComponent();

    return () => {
      isMounted = false;
    };
  }, [ticket.tags, loadTags]);

  const handleChange = async (e) => {
    const value = e.target.value;

    try {
      setUpdating(true);

      // Remove existing tag if present
      if (ticket.tags.length > 0) {
        await api.delete(`/ticket-tags/${ticket.id}`);
      }

      // Add new tag if selected
      if (value !== "") {
        await api.put(`/ticket-tags/${ticket.id}/${value}`);
      }

      setSelected(value);
      setUpdating(false);
    } catch (error) {
      toastError(error);
      setUpdating(false);
    }
  };

  const renderSelectedValue = () => {
    if (updating) {
      return (
        <Box display="flex" alignItems="center">
          <CircularProgress size={16} />
        </Box>
      );
    }

    if (!selected || selected === "") {
      return (
        <Box className={classes.emptyChip}>
          <AddIcon fontSize="small" />
          {i18n.t("tagKanban.selectStage")}
        </Box>
      );
    }

    const selectedTag = tags.find((tag) => tag.id === selected);
    if (!selectedTag) return null;

    return (
      <Chip
        className={classes.chip}
        style={{
          backgroundColor: selectedTag.color,
        }}
        label={selectedTag.name}
        size="small"
      />
    );
  };

  if (loading) {
    return (
      <Box className={classes.loading}>
        <CircularProgress size={24} />
      </Box>
    );
  }

  return (
    <FormControl variant="outlined" className={classes.formControl} fullWidth>
      <InputLabel id="tag-kanban-label" className={classes.label}>
        {i18n.t("tagKanban.title")}
      </InputLabel>

      <Select
        labelId="tag-kanban-label"
        id="tag-kanban-select"
        value={selected}
        onChange={handleChange}
        label={i18n.t("tagKanban.title")}
        disabled={updating}
        renderValue={renderSelectedValue}
        className={classes.select}
        MenuProps={{
          anchorOrigin: {
            vertical: "bottom",
            horizontal: "left",
          },
          transformOrigin: {
            vertical: "top",
            horizontal: "left",
          },
          getContentAnchorEl: null,
          MenuListProps: {
            className: classes.selectMenu,
          },
        }}
        IconComponent={ArrowDropDownIcon}
        classes={{
          icon: classes.selectIcon,
        }}
      >
        <Typography className={classes.menuHeader}>
          {i18n.t("tagKanban.stages")}
        </Typography>

        <MenuItem value="" className={classes.menuItem}>
          <Box className={classes.emptyItem}>{i18n.t("tagKanban.noStage")}</Box>
        </MenuItem>

        {tags.map((tag) => (
          <MenuItem key={tag.id} value={tag.id} className={classes.menuItem}>
            <Tooltip title={tag.name} arrow placement="right">
              <Box display="flex" alignItems="center" width="100%">
                <Box
                  className={classes.colorIndicator}
                  style={{ backgroundColor: tag.color }}
                />
                <Typography noWrap>{tag.name}</Typography>
              </Box>
            </Tooltip>
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
