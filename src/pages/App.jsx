import { useState, useContext, useEffect } from "react";
import {
  Box,
  DialogContent,
  Grid2,
  TextField,
  Tooltip,
  DialogContentText,
  FormControlLabel,
  Radio,
  RadioGroup,
  FormControl,
} from "@mui/material";
import { enqueueSnackbar } from "notistack";
import { postJson, getAndSetJson } from "pankosmia-lib/http";
import { doI18n } from "pankosmia-lib/i18n";
import { i18nContext, debugContext, Header } from "pankosmia-rcl";
import { PanDialog, PanDialogActions, PanLanguagePicker } from "pankosmia-rcl";
import SectionDialog from "../content/SectionDialog";

export default function NewOBSContent() {
  const { i18nRef } = useContext(i18nContext);
  const { debugRef } = useContext(debugContext);
  const [contentName, setContentName] = useState("");
  const [contentAbbr, setContentAbbr] = useState("");
  const [contentType, setContentType] = useState("x-printspecs");
  const [languageIsValid, setLanguageIsValid] = useState(true);

  const [currentLanguage, setCurrentLanguage] = useState({
    language_code: "",
    language_name: "",
  });
  const [open, setOpen] = useState(true);
  const [postCount, setPostCount] = useState(0);
  const [localRepos, setLocalRepos] = useState([]);
  const [repoExists, setRepoExists] = useState(false);

  const [copyright, setCopyright] = useState({
    author_name: "",
    year: "",
  });
  const [optionCopyright, setOptionCopyright] = useState("all_rights_reserved");
  const fullCopyright =
    optionCopyright !== "public-domain"
      ? `${copyright.author_name} ${copyright.year}`
      : `${doI18n(
          "pages:core-contenthander-print_specs:public_domain",
          i18nRef.current,
        )}`;
  const [errorAbbreviation, setErrorAbbreviation] = useState(false);
  const hash = window.location.hash;
  const query = hash.includes("?") ? hash.split("?") : "";
  const typePageQuery = new URLSearchParams(query[1]);
  const returnType = typePageQuery.get("returnTypePage");
  const regexAbbreviation = /^[A-Za-z0-9][A-Za-z0-9_]{0,6}[A-Za-z0-9]$/;
  const handleChange = (event) => {
    setOptionCopyright(event.target.value);
  };
  useEffect(() => {
    if (open) {
      getAndSetJson({
        url: "/api/git/list-local-repos",
        setter: setLocalRepos,
      }).then();
    }
  }, [open]);

  useEffect(() => {
    setContentName("");
    setContentAbbr("");
  }, [postCount]);

  const handleClose = () => {
    setOpen(false);
    if (returnType === "dashboard") {
      setTimeout(() => {
        window.location.href = "/clients/main";
      });
    } else {
      setTimeout(() => {
        window.location.href = "/clients/content";
      });
    }
  };

  const handleCreate = async () => {
    const payload = {
      content_name: contentName,
      content_abbr: contentAbbr,
      copyright: fullCopyright,
      content_language_code: currentLanguage.language_code,
    };
    const response = await postJson(
      "/api/git/new-print-spec-resource",
      JSON.stringify(payload),
      debugRef.current,
    );
    if (response.ok) {
      setPostCount(postCount + 1);
      enqueueSnackbar(
        doI18n(
          "pages:core-contenthander-print_specs:content_created",
          i18nRef.current,
        ),
        { variant: "success" },
      );
      // handleClose();
    } else {
      enqueueSnackbar(
        `${doI18n("pages:core-contenthander-print_specs:project_creation_error", i18nRef.current)}: `,
        { variant: "error" },
      );
    }
  };

  return (
    <Box>
      <Box
        sx={{
          position: "absolute",
          width: "100%",
          height: "100%",
          backgroundSize: "cover",
          backgroundPosition: "center",
          zIndex: -1,
          backgroundImage:
            'url("/api/app-resources/pages/content/background_blur.png")',
          backgroundRepeat: "no-repeat",
        }}
      />
      <Header
        titleKey={
          returnType === "dashboard"
            ? "pages:core-dashboard:title"
            : "pages:content:title"
        }
        currentId="content"
        requireNet={false}
      />

      <PanDialog
        titleLabel={doI18n(
          "pages:core-contenthander-print_specs:create_content_print_specs",
          i18nRef.current,
        )}
        isOpen={open}
        closeFn={() => handleClose()}
      >
        <DialogContentText variant="subtitle2" sx={{ ml: 1, p: 1 }}>
          {doI18n(
            `pages:core-contenthander-print_specs:required_field`,
            i18nRef.current,
          )}
        </DialogContentText>
        <DialogContent spacing={2}>
          <Grid2
            container
            spacing={2}
            justifyItems="flex-end"
            alignItems="stretch"
            flexDirection={"column"}
          >
            <TextField
              id="name"
              required
              label={doI18n(
                "pages:core-contenthander-print_specs:name",
                i18nRef.current,
              )}
              value={contentName}
              onChange={(event) => {
                setContentName(event.target.value);
              }}
            />
            <Tooltip
              open={repoExists}
              slotProps={{
                popper: {
                  modifiers: [{ name: "offset", options: { offset: [0, -7] } }],
                },
              }}
              title={doI18n(
                "pages:core-contenthander-print_specs:name_is_taken",
                i18nRef.current,
              )}
              placement="top-start"
            >
              <TextField
                id="abbr"
                error={errorAbbreviation}
                helperText={`${doI18n("pages:core-contenthander-print_specs:helper_abbreviation", i18nRef.current)}`}
                required
                label={doI18n(
                  "pages:core-contenthander-print_specs:abbreviation",
                  i18nRef.current,
                )}
                value={contentAbbr}
                onChange={(event) => {
                  const value = event.target.value;
                  setRepoExists(
                    localRepos.map((l) => l.split("/")[2]).includes(value),
                  );
                  setContentAbbr(value);
                  setErrorAbbreviation(
                    value.length > 0 && !regexAbbreviation.test(value),
                  );
                }}
              />
            </Tooltip>
            <PanLanguagePicker
              currentLanguage={currentLanguage}
              setCurrentLanguage={setCurrentLanguage}
              setIsValid={setLanguageIsValid}
            />
            <SectionDialog titleSection="Copyright">
              <FormControl>
                <RadioGroup
                  value={optionCopyright}
                  onChange={handleChange}
                  row
                  name="row-radio-buttons-group"
                >
                  <FormControlLabel
                    value="all_rights_reserved"
                    control={<Radio />}
                    label="All rights reserved"
                  />
                  <FormControlLabel
                    value="public-domain"
                    control={<Radio />}
                    label={doI18n(
                      "pages:core-contenthander-print_specs:public_domain",
                      i18nRef.current,
                    )}
                  />
                </RadioGroup>
              </FormControl>
              {optionCopyright === "all_rights_reserved" && (
                <>
                  <TextField
                    id="author_name"
                    sx={{ width: "100%" }}
                    required
                    label={doI18n(
                      "pages:core-contenthander-print_specs:author_name",
                      i18nRef.current,
                    )}
                    value={copyright.author_name}
                    onChange={(e) =>
                      setCopyright({
                        ...copyright,
                        author_name: e.target.value,
                      })
                    }
                  />

                  <TextField
                    sx={{ width: "100%" }}
                    id="year"
                    required
                    label={doI18n(
                      "pages:core-contenthander-print_specs:year",
                      i18nRef.current,
                    )}
                    value={copyright.year}
                    onChange={(e) =>
                      setCopyright({
                        ...copyright,
                        year: e.target.value.replace(/\D/g, "").slice(0, 4),
                      })
                    }
                  />
                </>
              )}
            </SectionDialog>
          </Grid2>
        </DialogContent>
        <PanDialogActions
          closeFn={() => handleClose()}
          closeLabel={doI18n(
            "pages:core-contenthander-print_specs:close",
            i18nRef.current,
          )}
          actionFn={handleCreate}
          closeOnAction={false}
          actionLabel={doI18n(
            "pages:core-contenthander-print_specs:create",
            i18nRef.current,
          )}
          isDisabled={
            !(
              contentName.trim().length > 0 &&
              contentAbbr.trim().length > 0 &&
              contentType.trim().length > 0 &&
              errorAbbreviation === false &&
              languageIsValid === true
            ) || repoExists
          }
        />
      </PanDialog>
    </Box>
  );
}
