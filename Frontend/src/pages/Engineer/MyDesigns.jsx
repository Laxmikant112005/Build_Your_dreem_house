import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Grid,
  Plus,
  Eye,
  Archive,
  Trash2,
  Send,
  AlertCircle,
  FileText,
  RefreshCw,
  Image as ImageIcon,
  BedDouble,
  Ruler,
  Palette,
  MoreHorizontal,
  Loader2,
  CheckCircle2,
  Clock3,
  XCircle,
  ArchiveRestore,
} from 'lucide-react';
import { toast } from 'react-hot-toast';

import { blueprintService } from '../../services/blueprintService';
import { cn } from '../../utils/cn';


/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

const getBlueprintId = (blueprint) =>
  blueprint?.id ||
  blueprint?._id ||
  blueprint?.blueprintId ||
  null;


const normalizeStatus = (status) =>
  String(status || 'draft')
    .trim()
    .toLowerCase();


const getStatusLabel = (status) => {
  const normalized = normalizeStatus(status);

  const labels = {
    draft: 'Draft',
    pending: 'Pending',
    submitted: 'Pending',
    approved: 'Approved',
    rejected: 'Rejected',
    archived: 'Archived',
  };

  return labels[normalized] || 'Draft';
};


const getBlueprintImages = (blueprint) => {
  const possibleImages = [
    blueprint?.files?.images,
    blueprint?.images,
    blueprint?.media?.images,
    blueprint?.files,
  ];

  for (const source of possibleImages) {
    if (!Array.isArray(source)) continue;

    const urls = source
      .map((item) => {
        if (typeof item === 'string') {
          return item;
        }

        return (
          item?.url ||
          item?.secure_url ||
          item?.secureUrl ||
          item?.path ||
          item?.src ||
          null
        );
      })
      .filter(Boolean);

    if (urls.length > 0) {
      return urls;
    }
  }

  return [];
};


const getPrimaryImage = (blueprint) => {
  const images = getBlueprintImages(blueprint);

  return images[0] || null;
};


const getBlueprintSpecs = (blueprint) => {
  return (
    blueprint?.specs ||
    blueprint?.specifications ||
    blueprint?.details ||
    {}
  );
};


const getErrorMessage = (error, fallback = 'Something went wrong.') => {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    fallback
  );
};


/* -------------------------------------------------------------------------- */
/* Main Component                                                             */
/* -------------------------------------------------------------------------- */

const MyDesigns = () => {
  const [blueprints, setBlueprints] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState(null);

  const [filter, setFilter] = useState('all');

  const [activeAction, setActiveAction] = useState(null);

  const [selectedBlueprint, setSelectedBlueprint] = useState(null);


  /* ------------------------------------------------------------------------ */
  /* Fetch blueprints                                                         */
  /* ------------------------------------------------------------------------ */

  const fetchBlueprints = useCallback(
    async ({ silent = false } = {}) => {
      if (silent) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError(null);

      try {
        const response = await blueprintService.getMyBlueprints({
          limit: 100,
        });

        /*
         * Support common API response structures:
         *
         * {
         *   data: {
         *     blueprints: []
         *   }
         * }
         *
         * {
         *   data: []
         * }
         *
         * {
         *   blueprints: []
         * }
         */

        const payload = response?.data;

        let list = [];

        if (Array.isArray(payload)) {
          list = payload;
        } else if (Array.isArray(payload?.blueprints)) {
          list = payload.blueprints;
        } else if (Array.isArray(payload?.data)) {
          list = payload.data;
        } else if (Array.isArray(response?.blueprints)) {
          list = response.blueprints;
        } else if (Array.isArray(response?.data?.data)) {
          list = response.data.data;
        }

        /*
         * Remove invalid records so rendering never crashes.
         */
        const validBlueprints = list.filter(
          (blueprint) =>
            blueprint &&
            typeof blueprint === 'object'
        );

        setBlueprints(validBlueprints);
      } catch (requestError) {
        console.error(
          'Failed to load blueprints:',
          requestError
        );

        setError(
          getErrorMessage(
            requestError,
            'Failed to load your blueprints.'
          )
        );

        if (silent) {
          toast.error(
            getErrorMessage(
              requestError,
              'Failed to refresh blueprints.'
            )
          );
        }
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    []
  );


  /* ------------------------------------------------------------------------ */
  /* Initial load                                                             */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    fetchBlueprints();
  }, [fetchBlueprints]);


  /* ------------------------------------------------------------------------ */
  /* Filter                                                                   */
  /* ------------------------------------------------------------------------ */

  const filteredBlueprints = useMemo(() => {
    if (filter === 'all') {
      return blueprints;
    }

    return blueprints.filter((blueprint) => {
      const status = normalizeStatus(blueprint?.status);

      /*
       * Some backends use "submitted" instead of "pending".
       * Treat both as pending in the UI.
       */
      if (filter === 'pending') {
        return (
          status === 'pending' ||
          status === 'submitted'
        );
      }

      return status === filter;
    });
  }, [blueprints, filter]);


  /* ------------------------------------------------------------------------ */
  /* Counts                                                                   */
  /* ------------------------------------------------------------------------ */

  const statusCounts = useMemo(() => {
    const counts = {
      all: blueprints.length,
      draft: 0,
      pending: 0,
      approved: 0,
      rejected: 0,
      archived: 0,
    };

    blueprints.forEach((blueprint) => {
      const status = normalizeStatus(
        blueprint?.status
      );

      if (status === 'submitted') {
        counts.pending += 1;
      } else if (
        Object.prototype.hasOwnProperty.call(
          counts,
          status
        )
      ) {
        counts[status] += 1;
      }
    });

    return counts;
  }, [blueprints]);


  /* ------------------------------------------------------------------------ */
  /* Actions                                                                  */
  /* ------------------------------------------------------------------------ */

  const handleAction = async (action, blueprint) => {
    const id = getBlueprintId(blueprint);

    if (!id) {
      toast.error(
        'This blueprint does not have a valid ID.'
      );

      return;
    }

    if (activeAction) {
      return;
    }

    if (action === 'delete') {
      const confirmed = window.confirm(
        'Are you sure you want to delete this blueprint? This action cannot be undone.'
      );

      if (!confirmed) {
        return;
      }
    }

    setActiveAction(`${action}:${id}`);
    setError(null);

    try {
      if (action === 'submit') {
        await blueprintService.submitForApproval(id);

        toast.success(
          'Blueprint submitted for approval.'
        );
      }

      if (action === 'archive') {
        await blueprintService.update(id, {
          status: 'archived',
        });

        toast.success('Blueprint archived.');
      }

      if (action === 'delete') {
        await blueprintService.remove(id);

        toast.success('Blueprint deleted.');
      }

      /*
       * Refresh after successful action.
       */
      await fetchBlueprints({ silent: true });
    } catch (actionError) {
      console.error(
        `Blueprint ${action} failed:`,
        actionError
      );

      const message = getErrorMessage(
        actionError,
        `Failed to ${action} blueprint.`
      );

      toast.error(message);
      setError(message);
    } finally {
      setActiveAction(null);
    }
  };


  /* ------------------------------------------------------------------------ */
  /* Restore archived blueprint                                               */
  /* ------------------------------------------------------------------------ */

  const handleRestore = async (blueprint) => {
    const id = getBlueprintId(blueprint);

    if (!id || activeAction) {
      return;
    }

    setActiveAction(`restore:${id}`);

    try {
      await blueprintService.update(id, {
        status: 'draft',
      });

      toast.success('Blueprint restored to draft.');

      await fetchBlueprints({ silent: true });
    } catch (restoreError) {
      console.error(
        'Failed to restore blueprint:',
        restoreError
      );

      toast.error(
        getErrorMessage(
          restoreError,
          'Failed to restore blueprint.'
        )
      );
    } finally {
      setActiveAction(null);
    }
  };


  /* ------------------------------------------------------------------------ */
  /* Loading state                                                            */
  /* ------------------------------------------------------------------------ */

  if (loading) {
    return (
      <div className="min-h-[70vh] bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          {/* Header skeleton */}
          <div className="animate-pulse mb-10">
            <div className="h-10 w-72 bg-slate-200 rounded-xl mb-3" />
            <div className="h-5 w-96 max-w-full bg-slate-200 rounded-lg" />
          </div>

          {/* Filter skeleton */}
          <div className="animate-pulse flex gap-2 mb-8">
            {[1, 2, 3, 4, 5].map((item) => (
              <div
                key={item}
                className="h-10 w-24 bg-slate-200 rounded-full"
              />
            ))}
          </div>

          {/* Card skeletons */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="bg-white rounded-[2rem] border border-slate-200 overflow-hidden"
              >
                <div className="h-52 bg-slate-200" />

                <div className="p-5 space-y-4">
                  <div className="h-6 w-3/4 bg-slate-200 rounded-lg" />

                  <div className="h-4 w-full bg-slate-200 rounded-lg" />

                  <div className="h-4 w-2/3 bg-slate-200 rounded-lg" />

                  <div className="flex gap-2">
                    <div className="h-8 w-20 bg-slate-200 rounded-xl" />
                    <div className="h-8 w-20 bg-slate-200 rounded-xl" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }


  /* ------------------------------------------------------------------------ */
  /* Render                                                                   */
  /* ------------------------------------------------------------------------ */

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Decorative background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-gold/5 blur-3xl" />
        <div className="absolute top-1/2 -left-40 w-96 h-96 rounded-full bg-blue-500/5 blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">

        {/* ================================================================== */}
        {/* Header                                                             */}
        {/* ================================================================== */}

        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 md:w-16 md:h-16 bg-slate-950 rounded-[1.25rem] flex items-center justify-center shadow-xl">
              <Grid className="w-7 h-7 md:w-8 md:h-8 text-gold" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-3xl md:text-4xl font-black text-slate-950 tracking-tight">
                  My Blueprints
                </h1>

                <span className="hidden sm:inline-flex px-2.5 py-1 rounded-full bg-gold/10 text-gold text-[10px] font-black uppercase tracking-wider">
                  Portfolio
                </span>
              </div>

              <p className="text-slate-500 font-medium mt-1">
                Manage and showcase your architectural work.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() =>
                fetchBlueprints({ silent: true })
              }
              disabled={refreshing}
              className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-white border border-slate-200 text-slate-600 font-bold text-sm hover:border-gold hover:text-slate-950 transition disabled:opacity-50"
            >
              <RefreshCw
                className={cn(
                  'w-4 h-4',
                  refreshing && 'animate-spin'
                )}
              />

              <span className="hidden sm:inline">
                Refresh
              </span>
            </button>

            <Link
              to="/engineer/blueprints/new"
              className="btn-gold px-5 md:px-6 py-3 rounded-2xl font-black inline-flex items-center gap-2 shadow-lg hover:shadow-xl transition-all"
            >
              <Plus className="w-5 h-5" />
              Upload Blueprint
            </Link>
          </div>
        </div>


        {/* ================================================================== */}
        {/* Error                                                               */}
        {/* ================================================================== */}

        {error && (
          <div className="mb-8 bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />

            <div className="flex-1">
              <p className="font-bold text-red-800 text-sm">
                Unable to complete request
              </p>

              <p className="text-sm text-red-700 mt-1">
                {error}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setError(null)}
              className="p-1 rounded-lg hover:bg-red-100 text-red-500"
              aria-label="Close error"
            >
              ×
            </button>
          </div>
        )}


        {/* ================================================================== */}
        {/* Status filters                                                      */}
        {/* ================================================================== */}

        <div className="flex flex-wrap gap-2 mb-8">
          {[
            'all',
            'draft',
            'pending',
            'approved',
            'rejected',
            'archived',
          ].map((status) => {
            const count = statusCounts[status] || 0;

            return (
              <button
                key={status}
                type="button"
                onClick={() => setFilter(status)}
                className={cn(
                  'px-4 py-2.5 rounded-full text-sm font-bold capitalize transition-all duration-200 inline-flex items-center gap-2',
                  filter === status
                    ? 'bg-slate-950 text-white shadow-md'
                    : 'bg-white border border-slate-200 text-slate-600 hover:border-gold hover:text-slate-950'
                )}
              >
                {status}

                <span
                  className={cn(
                    'min-w-5 h-5 px-1 rounded-full flex items-center justify-center text-[10px]',
                    filter === status
                      ? 'bg-white/15 text-white'
                      : 'bg-slate-100 text-slate-500'
                  )}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>


        {/* ================================================================== */}
        {/* Empty state                                                         */}
        {/* ================================================================== */}

        {filteredBlueprints.length === 0 ? (
          <div className="text-center py-20 px-6 border-2 border-dashed border-slate-200 rounded-[2rem] bg-white/70 backdrop-blur">
            <div className="mx-auto w-20 h-20 rounded-3xl bg-slate-100 flex items-center justify-center mb-6">
              <FileText className="w-10 h-10 text-slate-300" />
            </div>

            <h3 className="text-2xl font-black text-slate-700 mb-3">
              {filter === 'all'
                ? 'No blueprints yet'
                : `No ${filter} blueprints`}
            </h3>

            <p className="text-slate-500 mb-8 max-w-md mx-auto leading-relaxed">
              {filter === 'all'
                ? 'Upload your first blueprint to build your portfolio and attract potential clients.'
                : `You currently don't have any blueprints with the ${filter} status.`}
            </p>

            {filter === 'all' && (
              <Link
                to="/engineer/blueprints/new"
                className="btn-gold px-6 py-3 rounded-2xl font-black inline-flex items-center gap-2 shadow-lg"
              >
                <Plus className="w-5 h-5" />
                Upload Blueprint
              </Link>
            )}
          </div>
        ) : (
          /* ================================================================= */
          /* Blueprint grid                                                     */
          /* ================================================================= */

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBlueprints.map((blueprint) => {
              const id = getBlueprintId(blueprint);

              const status = normalizeStatus(
                blueprint?.status
              );

              const statusLabel =
                getStatusLabel(status);

              const image = getPrimaryImage(
                blueprint
              );

              const specs =
                getBlueprintSpecs(blueprint);

              const title =
                blueprint?.title ||
                'Untitled Blueprint';

              const description =
                blueprint?.description ||
                'No description available for this blueprint.';

              const isSubmitting =
                activeAction === `submit:${id}`;

              const isArchiving =
                activeAction === `archive:${id}`;

              const isDeleting =
                activeAction === `delete:${id}`;

              const isRestoring =
                activeAction === `restore:${id}`;

              return (
                <article
                  key={id || `${title}-${Math.random()}`}
                  className="group bg-white rounded-[2rem] border border-slate-200 overflow-hidden shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
                >
                  {/* Image */}
                  <div className="h-52 bg-slate-100 relative overflow-hidden">
                    {image ? (
                      <img
                        src={image}
                        alt={title}
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        onError={(event) => {
                          event.currentTarget.style.display =
                            'none';

                          event.currentTarget.parentElement
                            ?.querySelector(
                              '[data-image-fallback]'
                            )
                            ?.classList.remove('hidden');
                        }}
                      />
                    ) : null}

                    {/* Image fallback */}
                    <div
                      data-image-fallback
                      className={cn(
                        'absolute inset-0 flex flex-col items-center justify-center',
                        image ? 'hidden' : ''
                      )}
                    >
                      <ImageIcon className="w-12 h-12 text-slate-300 mb-2" />

                      <p className="text-xs text-slate-400 font-medium">
                        No preview available
                      </p>
                    </div>

                    {/* Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent pointer-events-none" />

                    {/* Status */}
                    <span
                      className={cn(
                        'absolute top-4 left-4 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider backdrop-blur-sm',
                        statusStyle(status)
                      )}
                    >
                      {statusLabel}
                    </span>

                    {/* Image count */}
                    {getBlueprintImages(
                      blueprint
                    ).length > 1 && (
                      <span className="absolute top-4 right-4 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md text-white text-[10px] font-bold inline-flex items-center gap-1.5">
                        <ImageIcon className="w-3 h-3" />

                        {
                          getBlueprintImages(
                            blueprint
                          ).length
                        }
                      </span>
                    )}

                    {/* Preview button */}
                    <button
                      type="button"
                      onClick={() =>
                        setSelectedBlueprint(
                          blueprint
                        )
                      }
                      className="absolute bottom-4 right-4 w-10 h-10 rounded-xl bg-white/90 backdrop-blur flex items-center justify-center text-slate-700 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all shadow-lg hover:bg-gold"
                      aria-label={`Preview ${title}`}
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                  </div>


                  {/* Content */}
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="font-black text-slate-950 text-lg mb-1 truncate">
                          {title}
                        </h3>

                        <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed min-h-[40px]">
                          {description}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          setSelectedBlueprint(
                            blueprint
                          )
                        }
                        className="shrink-0 w-9 h-9 rounded-xl bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-400"
                        aria-label="More options"
                      >
                        <MoreHorizontal className="w-5 h-5" />
                      </button>
                    </div>


                    {/* Specs */}
                    <div className="flex flex-wrap gap-1.5 mt-4 mb-5">
                      {specs?.style && (
                        <Tag icon={Palette}>
                          {specs.style}
                        </Tag>
                      )}

                      {specs?.bedrooms !==
                        undefined &&
                        specs?.bedrooms !== null &&
                        specs?.bedrooms !== '' && (
                          <Tag icon={BedDouble}>
                            {specs.bedrooms} BHK
                          </Tag>
                        )}

                      {specs?.builtUpArea && (
                        <Tag icon={Ruler}>
                          {specs.builtUpArea} sqft
                        </Tag>
                      )}
                    </div>


                    {/* Actions */}
                    <div className="flex items-center gap-2 pt-4 border-t border-slate-100">
                      {/* Submit */}
                      {status === 'draft' && (
                        <ActionButton
                          icon={
                            isSubmitting
                              ? Loader2
                              : Send
                          }
                          label={
                            isSubmitting
                              ? 'Submitting...'
                              : 'Submit'
                          }
                          disabled={
                            !id ||
                            Boolean(activeAction)
                          }
                          loading={isSubmitting}
                          onClick={() =>
                            handleAction(
                              'submit',
                              blueprint
                            )
                          }
                          color="bg-gold text-slate-950 hover:bg-gold/80"
                        />
                      )}

                      {/* Archive */}
                      {(status === 'pending' ||
                        status === 'submitted' ||
                        status === 'approved') && (
                        <ActionButton
                          icon={
                            isArchiving
                              ? Loader2
                              : Archive
                          }
                          label={
                            isArchiving
                              ? 'Archiving...'
                              : 'Archive'
                          }
                          disabled={
                            !id ||
                            Boolean(activeAction)
                          }
                          loading={isArchiving}
                          onClick={() =>
                            handleAction(
                              'archive',
                              blueprint
                            )
                          }
                          color="bg-purple-50 text-purple-700 hover:bg-purple-100"
                        />
                      )}

                      {/* Restore */}
                      {status === 'archived' && (
                        <ActionButton
                          icon={
                            isRestoring
                              ? Loader2
                              : ArchiveRestore
                          }
                          label={
                            isRestoring
                              ? 'Restoring...'
                              : 'Restore'
                          }
                          disabled={
                            !id ||
                            Boolean(activeAction)
                          }
                          loading={isRestoring}
                          onClick={() =>
                            handleRestore(
                              blueprint
                            )
                          }
                          color="bg-blue-50 text-blue-700 hover:bg-blue-100"
                        />
                      )}

                      {/* Delete */}
                      <ActionButton
                        icon={
                          isDeleting
                            ? Loader2
                            : Trash2
                        }
                        label={
                          isDeleting
                            ? 'Deleting...'
                            : 'Delete'
                        }
                        disabled={
                          !id ||
                          Boolean(activeAction)
                        }
                        loading={isDeleting}
                        onClick={() =>
                          handleAction(
                            'delete',
                            blueprint
                          )
                        }
                        color="bg-red-50 text-red-600 hover:bg-red-100"
                      />
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>


      {/* ==================================================================== */}
      {/* Preview modal                                                        */}
      {/* ==================================================================== */}

      {selectedBlueprint && (
        <BlueprintPreviewModal
          blueprint={selectedBlueprint}
          onClose={() =>
            setSelectedBlueprint(null)
          }
        />
      )}
    </div>
  );
};


/* -------------------------------------------------------------------------- */
/* Status styles                                                              */
/* -------------------------------------------------------------------------- */

const statusStyle = (status) => {
  const normalized = normalizeStatus(status);

  if (normalized === 'approved') {
    return 'bg-emerald-100/95 text-emerald-800';
  }

  if (
    normalized === 'pending' ||
    normalized === 'submitted'
  ) {
    return 'bg-amber-100/95 text-amber-800';
  }

  if (normalized === 'draft') {
    return 'bg-slate-100/95 text-slate-700';
  }

  if (normalized === 'rejected') {
    return 'bg-red-100/95 text-red-700';
  }

  if (normalized === 'archived') {
    return 'bg-purple-100/95 text-purple-700';
  }

  return 'bg-slate-100/95 text-slate-600';
};


/* -------------------------------------------------------------------------- */
/* Tag                                                                        */
/* -------------------------------------------------------------------------- */

const Tag = ({ children, icon: Icon }) => (
  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 text-slate-600 rounded-full text-[10px] font-bold">
    {Icon && <Icon className="w-3 h-3" />}
    {children}
  </span>
);


/* -------------------------------------------------------------------------- */
/* Action Button                                                              */
/* -------------------------------------------------------------------------- */

const ActionButton = ({
  icon: Icon,
  label,
  onClick,
  color,
  disabled = false,
  loading = false,
}) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className={cn(
      'inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-black transition-all',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      color
    )}
  >
    <Icon
      className={cn(
        'w-4 h-4',
        loading && 'animate-spin'
      )}
    />

    <span>{label}</span>
  </button>
);


/* -------------------------------------------------------------------------- */
/* Preview Modal                                                              */
/* -------------------------------------------------------------------------- */

const BlueprintPreviewModal = ({
  blueprint,
  onClose,
}) => {
  const images = getBlueprintImages(
    blueprint
  );

  const [activeImage, setActiveImage] =
    useState(0);

  const image = images[activeImage];

  const title =
    blueprint?.title ||
    'Untitled Blueprint';

  const description =
    blueprint?.description ||
    'No description available.';

  const specs = getBlueprintSpecs(
    blueprint
  );

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm p-4 md:p-8 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-label={`${title} preview`}
      onMouseDown={(event) => {
        if (
          event.target ===
          event.currentTarget
        ) {
          onClose();
        }
      }}
    >
      <div className="w-full max-w-5xl max-h-[90vh] overflow-hidden bg-white rounded-[2rem] shadow-2xl flex flex-col">
        {/* Modal header */}
        <div className="flex items-center justify-between gap-4 px-5 md:px-7 py-4 border-b border-slate-200">
          <div className="min-w-0">
            <h2 className="font-black text-xl text-slate-950 truncate">
              {title}
            </h2>

            <p className="text-xs text-slate-400 mt-0.5">
              Blueprint preview
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-red-50 hover:text-red-500 flex items-center justify-center text-slate-500 transition"
            aria-label="Close preview"
          >
            <XCircle className="w-5 h-5" />
          </button>
        </div>

        {/* Modal content */}
        <div className="overflow-y-auto">
          <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr]">
            {/* Image */}
            <div className="bg-slate-950 min-h-[320px] lg:min-h-[500px] flex items-center justify-center">
              {image ? (
                <img
                  src={image}
                  alt={title}
                  className="max-h-[60vh] lg:max-h-[65vh] max-w-full object-contain"
                />
              ) : (
                <div className="text-center text-white/40">
                  <FileText className="w-16 h-16 mx-auto mb-3" />

                  <p className="text-sm">
                    No preview available
                  </p>
                </div>
              )}
            </div>

            {/* Details */}
            <div className="p-6 md:p-8">
              <p className="text-sm text-slate-500 leading-relaxed">
                {description}
              </p>

              {images.length > 1 && (
                <div className="mt-6">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">
                    Gallery
                  </p>

                  <div className="grid grid-cols-4 gap-2">
                    {images.map(
                      (galleryImage, index) => (
                        <button
                          type="button"
                          key={galleryImage}
                          onClick={() =>
                            setActiveImage(
                              index
                            )
                          }
                          className={cn(
                            'aspect-square rounded-xl overflow-hidden border-2 transition',
                            activeImage ===
                              index
                              ? 'border-gold'
                              : 'border-transparent'
                          )}
                        >
                          <img
                            src={galleryImage}
                            alt={`${title} ${
                              index + 1
                            }`}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      )
                    )}
                  </div>
                </div>
              )}

              <div className="mt-7">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">
                  Specifications
                </p>

                <div className="grid grid-cols-2 gap-3">
                  {specs?.style && (
                    <InfoItem
                      label="Style"
                      value={specs.style}
                    />
                  )}

                  {specs?.bedrooms !==
                    undefined && (
                    <InfoItem
                      label="Bedrooms"
                      value={`${specs.bedrooms} BHK`}
                    />
                  )}

                  {specs?.builtUpArea && (
                    <InfoItem
                      label="Built-up Area"
                      value={`${specs.builtUpArea} sqft`}
                    />
                  )}

                  {specs?.floors !==
                    undefined && (
                    <InfoItem
                      label="Floors"
                      value={specs.floors}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


/* -------------------------------------------------------------------------- */
/* Info Item                                                                  */
/* -------------------------------------------------------------------------- */

const InfoItem = ({ label, value }) => (
  <div className="rounded-xl bg-slate-50 border border-slate-100 p-3">
    <p className="text-[9px] uppercase tracking-widest font-black text-slate-400">
      {label}
    </p>

    <p className="text-sm font-bold text-slate-800 mt-1">
      {value}
    </p>
  </div>
);


export default MyDesigns;