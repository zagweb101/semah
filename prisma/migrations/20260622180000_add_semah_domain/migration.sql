-- CreateEnum
CREATE TYPE "ProjectStatus" AS ENUM ('DRAFT', 'BRIEF_IN_PROGRESS', 'READY_FOR_ANALYSIS', 'ANALYZING', 'STRATEGY_READY', 'VISUAL_DIRECTIONS_READY', 'INTERNAL_REVIEW', 'CLIENT_REVIEW', 'REVISION_REQUESTED', 'APPROVED', 'DELIVERED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "ProjectRole" AS ENUM ('PROJECT_OWNER', 'CREATIVE_DIRECTOR', 'DESIGNER', 'CONTRIBUTOR');

-- CreateEnum
CREATE TYPE "BriefStatus" AS ENUM ('DRAFT', 'COMPLETED');

-- CreateEnum
CREATE TYPE "VisualDirectionStatus" AS ENUM ('GENERATED', 'PINNED', 'SELECTED', 'DISCARDED');

-- CreateEnum
CREATE TYPE "ApprovalStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "CommentStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'REOPENED');

-- CreateEnum
CREATE TYPE "AuthorType" AS ENUM ('TEAM', 'CLIENT');

-- CreateEnum
CREATE TYPE "MoodboardItemSource" AS ENUM ('GENERATED', 'UPLOADED', 'EXTERNAL_REFERENCE');

-- CreateEnum
CREATE TYPE "ColorRole" AS ENUM ('PRIMARY', 'SECONDARY', 'ACCENT', 'BACKGROUND', 'SURFACE', 'TEXT_PRIMARY', 'TEXT_SECONDARY', 'MUTED', 'BORDER', 'SUCCESS', 'WARNING', 'ERROR');

-- CreateEnum
CREATE TYPE "AccessibilityLevel" AS ENUM ('AA_PASS', 'AA_FAIL', 'AAA_PASS');

-- CreateEnum
CREATE TYPE "TypographyStyleName" AS ENUM ('DISPLAY', 'HEADING', 'BODY', 'CAPTION', 'BUTTON');

-- CreateEnum
CREATE TYPE "LogoAssetType" AS ENUM ('RASTER_PREVIEW', 'SVG', 'APP_ICON', 'FAVICON');

-- CreateEnum
CREATE TYPE "BrandBookSectionType" AS ENUM ('COVER', 'ABOUT', 'STORY', 'VISION', 'MISSION', 'VALUES', 'AUDIENCE', 'PERSONALITY', 'POSITIONING', 'TONE', 'LOGO', 'LOGO_VARIATIONS', 'SAFE_AREA', 'MIN_SIZE', 'CORRECT_USE', 'WRONG_USE', 'COLORS', 'TYPOGRAPHY', 'MOODBOARD', 'IMAGE_STYLE', 'PATTERNS', 'ICONS', 'APPLICATIONS', 'DESIGN_TOKENS', 'CONTACT');

-- CreateEnum
CREATE TYPE "BrandSheetTemplate" AS ENUM ('DEFAULT', 'MINIMAL', 'EDITORIAL');

-- CreateEnum
CREATE TYPE "BrandBookLayout" AS ENUM ('CLASSIC', 'MODERN', 'EDITORIAL');

-- CreateEnum
CREATE TYPE "GenerationType" AS ENUM ('BRAND_STRATEGY', 'AUDIENCE_PERSONAS', 'VISUAL_DIRECTIONS', 'COLOR_PALETTE', 'TYPOGRAPHY_SYSTEM', 'MOODBOARD_GENERATION', 'MOODBOARD_ITEM_REGENERATION', 'LOGO_CONCEPTS', 'LOGO_PREVIEWS', 'BRAND_SHEET', 'BRAND_BOOK', 'PDF_EXPORT', 'HIGH_RES_EXPORT');

-- CreateEnum
CREATE TYPE "AIJobStatus" AS ENUM ('QUEUED', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "AIProviderType" AS ENUM ('MOCK', 'OPENAI_COMPATIBLE', 'OPENAI_IMAGE');

-- CreateEnum
CREATE TYPE "AIProviderKind" AS ENUM ('TEXT', 'IMAGE');

-- CreateEnum
CREATE TYPE "HealthStatus" AS ENUM ('HEALTHY', 'DEGRADED', 'DOWN', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "CreditTransactionType" AS ENUM ('CREDIT', 'DEBIT', 'RESERVATION', 'CAPTURE', 'REFUND', 'ADJUSTMENT', 'EXPIRATION', 'BONUS');

-- CreateEnum
CREATE TYPE "CreditOperationType" AS ENUM ('BRAND_STRATEGY', 'AUDIENCE_PERSONAS', 'VISUAL_DIRECTIONS', 'COLOR_PALETTE', 'TYPOGRAPHY_SYSTEM', 'MOODBOARD_GENERATION', 'MOODBOARD_ITEM_REGENERATION', 'LOGO_CONCEPTS', 'LOGO_PREVIEWS', 'BRAND_SHEET', 'BRAND_BOOK', 'PDF_EXPORT', 'HIGH_RES_EXPORT');

-- CreateEnum
CREATE TYPE "AssetType" AS ENUM ('IMAGE', 'LOGO', 'REFERENCE', 'PDF', 'EXPORT', 'BRAND_ASSET');

-- CreateEnum
CREATE TYPE "ExportType" AS ENUM ('BRAND_SHEET_PDF', 'BRAND_BOOK_PDF', 'MOODBOARD_PNG', 'COLOR_PALETTE_PNG', 'COLOR_PALETTE_JSON', 'TYPOGRAPHY_JSON', 'DESIGN_TOKENS_JSON', 'CSS_VARIABLES', 'TAILWIND_THEME', 'ZIP_ASSETS');

-- CreateEnum
CREATE TYPE "ExportStatus" AS ENUM ('QUEUED', 'PROCESSING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "ProjectActivityType" AS ENUM ('CREATED', 'BRIEF_UPDATED', 'STRATEGY_GENERATED', 'DIRECTION_SELECTED', 'PALETTE_GENERATED', 'TYPOGRAPHY_GENERATED', 'MOODBOARD_UPDATED', 'LOGO_GENERATED', 'SHEET_CREATED', 'BOOK_CREATED', 'SHARED', 'COMMENTED', 'APPROVED', 'REVISION_REQUESTED', 'STATUS_CHANGED', 'ARCHIVED', 'RESTORED');

-- CreateEnum
CREATE TYPE "CommentRelatedEntityType" AS ENUM ('PROJECT', 'STRATEGY_SECTION', 'VISUAL_DIRECTION', 'MOODBOARD_ITEM', 'COLOR_PALETTE', 'TYPOGRAPHY', 'LOGO_CONCEPT', 'BRAND_BOOK_SECTION');

-- CreateEnum
CREATE TYPE "ApprovalEntityType" AS ENUM ('VISUAL_DIRECTION', 'COLOR_PALETTE', 'TYPOGRAPHY', 'LOGO_CONCEPT', 'BRAND_BOOK', 'PROJECT');

-- AlterTable
ALTER TABLE "Membership" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Notification" ADD COLUMN     "relatedEntityId" TEXT,
ADD COLUMN     "relatedEntityType" TEXT;

-- CreateTable
CREATE TABLE "WorkspaceSettings" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "defaultLocale" TEXT NOT NULL DEFAULT 'ar',
    "defaultDirection" TEXT NOT NULL DEFAULT 'rtl',
    "brandColor" TEXT,
    "defaultProjectLanguage" TEXT NOT NULL DEFAULT 'ar',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkspaceSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BrandProject" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "nameAr" TEXT NOT NULL,
    "nameEn" TEXT,
    "slug" TEXT NOT NULL,
    "status" "ProjectStatus" NOT NULL DEFAULT 'DRAFT',
    "createdBy" TEXT NOT NULL,
    "archivedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BrandProject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectMember" (
    "id" TEXT NOT NULL,
    "brandProjectId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "ProjectRole" NOT NULL DEFAULT 'CONTRIBUTOR',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProjectMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectClient" (
    "id" TEXT NOT NULL,
    "brandProjectId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "company" TEXT,
    "phone" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProjectClient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BrandBrief" (
    "id" TEXT NOT NULL,
    "brandProjectId" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "data" JSONB NOT NULL,
    "status" "BriefStatus" NOT NULL DEFAULT 'DRAFT',
    "lastSavedAt" TIMESTAMP(3),
    "lastSavedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BrandBrief_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BrandBriefVersion" (
    "id" TEXT NOT NULL,
    "brandBriefId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "data" JSONB NOT NULL,
    "createdBy" TEXT NOT NULL,
    "changeNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BrandBriefVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BrandStrategy" (
    "id" TEXT NOT NULL,
    "brandProjectId" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "data" JSONB NOT NULL,
    "promptVersion" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "createdBy" TEXT NOT NULL,
    "isCurrent" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BrandStrategy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VisualDirection" (
    "id" TEXT NOT NULL,
    "brandProjectId" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "data" JSONB NOT NULL,
    "status" "VisualDirectionStatus" NOT NULL DEFAULT 'GENERATED',
    "promptVersion" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "isCurrent" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VisualDirection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Moodboard" (
    "id" TEXT NOT NULL,
    "brandProjectId" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "isCurrent" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Moodboard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MoodboardItem" (
    "id" TEXT NOT NULL,
    "moodboardId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "source" "MoodboardItemSource" NOT NULL,
    "provider" TEXT,
    "promptVersion" TEXT,
    "generationId" TEXT,
    "assetId" TEXT,
    "externalUrl" TEXT,
    "caption" TEXT,
    "notes" TEXT,
    "locked" BOOLEAN NOT NULL DEFAULT false,
    "width" INTEGER,
    "height" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MoodboardItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ColorPalette" (
    "id" TEXT NOT NULL,
    "brandProjectId" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "isCurrent" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ColorPalette_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ColorSwatch" (
    "id" TEXT NOT NULL,
    "paletteId" TEXT NOT NULL,
    "role" "ColorRole" NOT NULL,
    "name" TEXT NOT NULL,
    "hex" TEXT NOT NULL,
    "rgb" TEXT NOT NULL,
    "hsl" TEXT NOT NULL,
    "cmykApprox" TEXT NOT NULL,
    "usage" TEXT,
    "percentage" INTEGER,
    "contrastOnWhite" DOUBLE PRECISION,
    "contrastOnBlack" DOUBLE PRECISION,
    "accessibility" "AccessibilityLevel",
    "suggestedForeground" TEXT,
    "locked" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "ColorSwatch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TypographySystem" (
    "id" TEXT NOT NULL,
    "brandProjectId" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "isCurrent" BOOLEAN NOT NULL DEFAULT true,
    "data" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TypographySystem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TypographyStyle" (
    "id" TEXT NOT NULL,
    "typographySystemId" TEXT NOT NULL,
    "name" "TypographyStyleName" NOT NULL,
    "fontFamily" TEXT NOT NULL,
    "fontWeight" INTEGER NOT NULL,
    "fontSize" TEXT NOT NULL,
    "lineHeight" TEXT NOT NULL,
    "letterSpacing" TEXT,
    "paragraphSpacing" TEXT,

    CONSTRAINT "TypographyStyle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LogoConcept" (
    "id" TEXT NOT NULL,
    "brandProjectId" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "name" TEXT NOT NULL,
    "rationale" TEXT NOT NULL,
    "symbolMeaning" TEXT,
    "typographyDirection" TEXT,
    "colorDirection" TEXT,
    "composition" TEXT,
    "prompt" TEXT NOT NULL,
    "approvalStatus" "ApprovalStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LogoConcept_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LogoAsset" (
    "id" TEXT NOT NULL,
    "logoConceptId" TEXT NOT NULL,
    "type" "LogoAssetType" NOT NULL,
    "assetId" TEXT NOT NULL,
    "isVector" BOOLEAN NOT NULL DEFAULT false,
    "metadata" JSONB NOT NULL,

    CONSTRAINT "LogoAsset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BrandSheet" (
    "id" TEXT NOT NULL,
    "brandProjectId" TEXT NOT NULL,
    "template" "BrandSheetTemplate" NOT NULL DEFAULT 'DEFAULT',
    "data" JSONB NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "isCurrent" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BrandSheet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BrandBook" (
    "id" TEXT NOT NULL,
    "brandProjectId" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "isCurrent" BOOLEAN NOT NULL DEFAULT true,
    "coverAssetId" TEXT,
    "layout" "BrandBookLayout" NOT NULL DEFAULT 'CLASSIC',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BrandBook_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BrandBookSection" (
    "id" TEXT NOT NULL,
    "brandBookId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "type" "BrandBookSectionType" NOT NULL,
    "title" TEXT NOT NULL,
    "content" JSONB NOT NULL,
    "hidden" BOOLEAN NOT NULL DEFAULT false,
    "customAssetId" TEXT,

    CONSTRAINT "BrandBookSection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShareLink" (
    "id" TEXT NOT NULL,
    "brandProjectId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "passwordHash" TEXT,
    "expiresAt" TIMESTAMP(3),
    "allowDownload" BOOLEAN NOT NULL DEFAULT false,
    "allowComment" BOOLEAN NOT NULL DEFAULT true,
    "allowApprove" BOOLEAN NOT NULL DEFAULT false,
    "revokedAt" TIMESTAMP(3),
    "lastAccessedAt" TIMESTAMP(3),
    "lastAccessIpHash" TEXT,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ShareLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Comment" (
    "id" TEXT NOT NULL,
    "brandProjectId" TEXT NOT NULL,
    "authorId" TEXT,
    "authorName" TEXT NOT NULL,
    "authorType" "AuthorType" NOT NULL,
    "relatedEntityType" "CommentRelatedEntityType" NOT NULL,
    "relatedEntityId" TEXT NOT NULL,
    "relatedVersion" INTEGER,
    "body" TEXT NOT NULL,
    "mentions" JSONB,
    "status" "CommentStatus" NOT NULL DEFAULT 'OPEN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Comment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CommentReply" (
    "id" TEXT NOT NULL,
    "commentId" TEXT NOT NULL,
    "authorId" TEXT,
    "authorName" TEXT NOT NULL,
    "authorType" "AuthorType" NOT NULL,
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CommentReply_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Approval" (
    "id" TEXT NOT NULL,
    "brandProjectId" TEXT NOT NULL,
    "approverType" "AuthorType" NOT NULL,
    "approverId" TEXT,
    "approverName" TEXT NOT NULL,
    "approvedEntityType" "ApprovalEntityType" NOT NULL,
    "approvedEntityId" TEXT NOT NULL,
    "approvedVersion" INTEGER,
    "comment" TEXT,
    "ipHash" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Approval_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RevisionRequest" (
    "id" TEXT NOT NULL,
    "brandProjectId" TEXT NOT NULL,
    "requestedByType" "AuthorType" NOT NULL,
    "requestedById" TEXT,
    "requestedByName" TEXT NOT NULL,
    "relatedEntityType" "CommentRelatedEntityType" NOT NULL,
    "relatedEntityId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" "CommentStatus" NOT NULL DEFAULT 'OPEN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RevisionRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Asset" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "brandProjectId" TEXT,
    "uploadedById" TEXT NOT NULL,
    "type" "AssetType" NOT NULL,
    "uploadThingKey" TEXT,
    "url" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "width" INTEGER,
    "height" INTEGER,
    "hash" TEXT,
    "metadata" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Asset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Export" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "brandProjectId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "ExportType" NOT NULL,
    "status" "ExportStatus" NOT NULL DEFAULT 'QUEUED',
    "assetId" TEXT,
    "version" INTEGER,
    "metadata" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "Export_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AIProviderConfig" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT,
    "kind" "AIProviderKind" NOT NULL,
    "provider" "AIProviderType" NOT NULL,
    "model" TEXT NOT NULL,
    "baseUrl" TEXT,
    "apiKeyRef" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "healthStatus" "HealthStatus" NOT NULL DEFAULT 'UNKNOWN',
    "lastHealthCheck" TIMESTAMP(3),
    "metadata" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AIProviderConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AIJob" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "brandProjectId" TEXT,
    "userId" TEXT NOT NULL,
    "generationType" "GenerationType" NOT NULL,
    "provider" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "status" "AIJobStatus" NOT NULL DEFAULT 'QUEUED',
    "progress" INTEGER NOT NULL DEFAULT 0,
    "inputHash" TEXT NOT NULL,
    "idempotencyKey" TEXT NOT NULL,
    "inputMetadata" JSONB NOT NULL,
    "outputMetadata" JSONB,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "maxAttempts" INTEGER NOT NULL DEFAULT 3,
    "errorCode" TEXT,
    "safeErrorMessage" TEXT,
    "reservedCredits" INTEGER NOT NULL DEFAULT 0,
    "actualCredits" INTEGER NOT NULL DEFAULT 0,
    "estimatedCost" DOUBLE PRECISION,
    "actualCost" DOUBLE PRECISION,
    "promptVersion" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "startedAt" TIMESTAMP(3),
    "finishedAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),

    CONSTRAINT "AIJob_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Generation" (
    "id" TEXT NOT NULL,
    "aiJobId" TEXT NOT NULL,
    "brandProjectId" TEXT NOT NULL,
    "generationType" "GenerationType" NOT NULL,
    "output" JSONB NOT NULL,
    "provider" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "promptVersion" TEXT NOT NULL,
    "inputHash" TEXT NOT NULL,
    "tokensUsed" INTEGER,
    "costEstimate" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Generation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GenerationVersion" (
    "id" TEXT NOT NULL,
    "generationId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "output" JSONB NOT NULL,
    "editedBy" TEXT,
    "editedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GenerationVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AIUsage" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "aiJobId" TEXT,
    "generationType" "GenerationType" NOT NULL,
    "provider" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "tokensIn" INTEGER NOT NULL DEFAULT 0,
    "tokensOut" INTEGER NOT NULL DEFAULT 0,
    "imagesGenerated" INTEGER NOT NULL DEFAULT 0,
    "costEstimate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AIUsage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CreditWallet" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "balance" INTEGER NOT NULL DEFAULT 0,
    "reserved" INTEGER NOT NULL DEFAULT 0,
    "totalGranted" INTEGER NOT NULL DEFAULT 0,
    "totalSpent" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CreditWallet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CreditTransaction" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "walletId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "brandProjectId" TEXT,
    "aiJobId" TEXT,
    "type" "CreditTransactionType" NOT NULL,
    "operationType" "CreditOperationType",
    "amount" INTEGER NOT NULL,
    "balanceBefore" INTEGER NOT NULL,
    "balanceAfter" INTEGER NOT NULL,
    "idempotencyKey" TEXT NOT NULL,
    "reason" TEXT,
    "adminId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CreditTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectActivity" (
    "id" TEXT NOT NULL,
    "brandProjectId" TEXT NOT NULL,
    "userId" TEXT,
    "type" "ProjectActivityType" NOT NULL,
    "metadata" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProjectActivity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "resourceType" TEXT NOT NULL,
    "resourceId" TEXT,
    "metadata" JSONB NOT NULL,
    "ipHash" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_AssetToComment" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_AssetToComment_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "WorkspaceSettings_organizationId_key" ON "WorkspaceSettings"("organizationId");

-- CreateIndex
CREATE INDEX "BrandProject_organizationId_status_idx" ON "BrandProject"("organizationId", "status");

-- CreateIndex
CREATE INDEX "BrandProject_organizationId_updatedAt_idx" ON "BrandProject"("organizationId", "updatedAt");

-- CreateIndex
CREATE INDEX "BrandProject_createdBy_idx" ON "BrandProject"("createdBy");

-- CreateIndex
CREATE UNIQUE INDEX "BrandProject_organizationId_slug_key" ON "BrandProject"("organizationId", "slug");

-- CreateIndex
CREATE INDEX "ProjectMember_userId_idx" ON "ProjectMember"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ProjectMember_brandProjectId_userId_key" ON "ProjectMember"("brandProjectId", "userId");

-- CreateIndex
CREATE INDEX "ProjectClient_brandProjectId_idx" ON "ProjectClient"("brandProjectId");

-- CreateIndex
CREATE UNIQUE INDEX "BrandBrief_brandProjectId_key" ON "BrandBrief"("brandProjectId");

-- CreateIndex
CREATE INDEX "BrandBriefVersion_brandBriefId_idx" ON "BrandBriefVersion"("brandBriefId");

-- CreateIndex
CREATE UNIQUE INDEX "BrandBriefVersion_brandBriefId_version_key" ON "BrandBriefVersion"("brandBriefId", "version");

-- CreateIndex
CREATE INDEX "BrandStrategy_brandProjectId_isCurrent_idx" ON "BrandStrategy"("brandProjectId", "isCurrent");

-- CreateIndex
CREATE UNIQUE INDEX "BrandStrategy_brandProjectId_version_key" ON "BrandStrategy"("brandProjectId", "version");

-- CreateIndex
CREATE INDEX "VisualDirection_brandProjectId_status_idx" ON "VisualDirection"("brandProjectId", "status");

-- CreateIndex
CREATE INDEX "VisualDirection_brandProjectId_isCurrent_idx" ON "VisualDirection"("brandProjectId", "isCurrent");

-- CreateIndex
CREATE INDEX "Moodboard_brandProjectId_isCurrent_idx" ON "Moodboard"("brandProjectId", "isCurrent");

-- CreateIndex
CREATE INDEX "MoodboardItem_moodboardId_idx" ON "MoodboardItem"("moodboardId");

-- CreateIndex
CREATE UNIQUE INDEX "MoodboardItem_moodboardId_order_key" ON "MoodboardItem"("moodboardId", "order");

-- CreateIndex
CREATE INDEX "ColorPalette_brandProjectId_isCurrent_idx" ON "ColorPalette"("brandProjectId", "isCurrent");

-- CreateIndex
CREATE INDEX "ColorSwatch_paletteId_idx" ON "ColorSwatch"("paletteId");

-- CreateIndex
CREATE UNIQUE INDEX "ColorSwatch_paletteId_role_key" ON "ColorSwatch"("paletteId", "role");

-- CreateIndex
CREATE INDEX "TypographySystem_brandProjectId_isCurrent_idx" ON "TypographySystem"("brandProjectId", "isCurrent");

-- CreateIndex
CREATE UNIQUE INDEX "TypographyStyle_typographySystemId_name_key" ON "TypographyStyle"("typographySystemId", "name");

-- CreateIndex
CREATE INDEX "LogoConcept_brandProjectId_approvalStatus_idx" ON "LogoConcept"("brandProjectId", "approvalStatus");

-- CreateIndex
CREATE INDEX "LogoAsset_logoConceptId_idx" ON "LogoAsset"("logoConceptId");

-- CreateIndex
CREATE UNIQUE INDEX "BrandSheet_brandProjectId_key" ON "BrandSheet"("brandProjectId");

-- CreateIndex
CREATE INDEX "BrandBook_brandProjectId_isCurrent_idx" ON "BrandBook"("brandProjectId", "isCurrent");

-- CreateIndex
CREATE INDEX "BrandBookSection_brandBookId_order_idx" ON "BrandBookSection"("brandBookId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "BrandBookSection_brandBookId_type_key" ON "BrandBookSection"("brandBookId", "type");

-- CreateIndex
CREATE UNIQUE INDEX "ShareLink_token_key" ON "ShareLink"("token");

-- CreateIndex
CREATE INDEX "ShareLink_brandProjectId_idx" ON "ShareLink"("brandProjectId");

-- CreateIndex
CREATE INDEX "Comment_brandProjectId_relatedEntityType_relatedEntityId_idx" ON "Comment"("brandProjectId", "relatedEntityType", "relatedEntityId");

-- CreateIndex
CREATE INDEX "Comment_brandProjectId_status_idx" ON "Comment"("brandProjectId", "status");

-- CreateIndex
CREATE INDEX "CommentReply_commentId_idx" ON "CommentReply"("commentId");

-- CreateIndex
CREATE INDEX "Approval_brandProjectId_approvedEntityType_approvedEntityId_idx" ON "Approval"("brandProjectId", "approvedEntityType", "approvedEntityId");

-- CreateIndex
CREATE INDEX "RevisionRequest_brandProjectId_status_idx" ON "RevisionRequest"("brandProjectId", "status");

-- CreateIndex
CREATE INDEX "Asset_organizationId_type_idx" ON "Asset"("organizationId", "type");

-- CreateIndex
CREATE INDEX "Asset_brandProjectId_idx" ON "Asset"("brandProjectId");

-- CreateIndex
CREATE INDEX "Asset_hash_idx" ON "Asset"("hash");

-- CreateIndex
CREATE INDEX "Export_brandProjectId_type_idx" ON "Export"("brandProjectId", "type");

-- CreateIndex
CREATE INDEX "Export_status_idx" ON "Export"("status");

-- CreateIndex
CREATE INDEX "AIProviderConfig_organizationId_kind_isActive_idx" ON "AIProviderConfig"("organizationId", "kind", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "AIJob_idempotencyKey_key" ON "AIJob"("idempotencyKey");

-- CreateIndex
CREATE INDEX "AIJob_organizationId_status_idx" ON "AIJob"("organizationId", "status");

-- CreateIndex
CREATE INDEX "AIJob_brandProjectId_status_idx" ON "AIJob"("brandProjectId", "status");

-- CreateIndex
CREATE INDEX "AIJob_userId_createdAt_idx" ON "AIJob"("userId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Generation_aiJobId_key" ON "Generation"("aiJobId");

-- CreateIndex
CREATE INDEX "Generation_brandProjectId_generationType_idx" ON "Generation"("brandProjectId", "generationType");

-- CreateIndex
CREATE UNIQUE INDEX "GenerationVersion_generationId_version_key" ON "GenerationVersion"("generationId", "version");

-- CreateIndex
CREATE INDEX "AIUsage_organizationId_createdAt_idx" ON "AIUsage"("organizationId", "createdAt");

-- CreateIndex
CREATE INDEX "AIUsage_userId_createdAt_idx" ON "AIUsage"("userId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "CreditWallet_organizationId_key" ON "CreditWallet"("organizationId");

-- CreateIndex
CREATE INDEX "CreditWallet_organizationId_idx" ON "CreditWallet"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "CreditTransaction_idempotencyKey_key" ON "CreditTransaction"("idempotencyKey");

-- CreateIndex
CREATE INDEX "CreditTransaction_organizationId_createdAt_idx" ON "CreditTransaction"("organizationId", "createdAt");

-- CreateIndex
CREATE INDEX "CreditTransaction_walletId_createdAt_idx" ON "CreditTransaction"("walletId", "createdAt");

-- CreateIndex
CREATE INDEX "CreditTransaction_aiJobId_idx" ON "CreditTransaction"("aiJobId");

-- CreateIndex
CREATE INDEX "ProjectActivity_brandProjectId_createdAt_idx" ON "ProjectActivity"("brandProjectId", "createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_organizationId_createdAt_idx" ON "AuditLog"("organizationId", "createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_userId_createdAt_idx" ON "AuditLog"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_action_createdAt_idx" ON "AuditLog"("action", "createdAt");

-- CreateIndex
CREATE INDEX "_AssetToComment_B_index" ON "_AssetToComment"("B");

-- AddForeignKey
ALTER TABLE "WorkspaceSettings" ADD CONSTRAINT "WorkspaceSettings_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BrandProject" ADD CONSTRAINT "BrandProject_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BrandProject" ADD CONSTRAINT "BrandProject_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectMember" ADD CONSTRAINT "ProjectMember_brandProjectId_fkey" FOREIGN KEY ("brandProjectId") REFERENCES "BrandProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectMember" ADD CONSTRAINT "ProjectMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectClient" ADD CONSTRAINT "ProjectClient_brandProjectId_fkey" FOREIGN KEY ("brandProjectId") REFERENCES "BrandProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BrandBrief" ADD CONSTRAINT "BrandBrief_lastSavedBy_fkey" FOREIGN KEY ("lastSavedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BrandBrief" ADD CONSTRAINT "BrandBrief_brandProjectId_fkey" FOREIGN KEY ("brandProjectId") REFERENCES "BrandProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BrandBriefVersion" ADD CONSTRAINT "BrandBriefVersion_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BrandBriefVersion" ADD CONSTRAINT "BrandBriefVersion_brandBriefId_fkey" FOREIGN KEY ("brandBriefId") REFERENCES "BrandBrief"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BrandStrategy" ADD CONSTRAINT "BrandStrategy_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BrandStrategy" ADD CONSTRAINT "BrandStrategy_brandProjectId_fkey" FOREIGN KEY ("brandProjectId") REFERENCES "BrandProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VisualDirection" ADD CONSTRAINT "VisualDirection_brandProjectId_fkey" FOREIGN KEY ("brandProjectId") REFERENCES "BrandProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Moodboard" ADD CONSTRAINT "Moodboard_brandProjectId_fkey" FOREIGN KEY ("brandProjectId") REFERENCES "BrandProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MoodboardItem" ADD CONSTRAINT "MoodboardItem_moodboardId_fkey" FOREIGN KEY ("moodboardId") REFERENCES "Moodboard"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ColorPalette" ADD CONSTRAINT "ColorPalette_brandProjectId_fkey" FOREIGN KEY ("brandProjectId") REFERENCES "BrandProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ColorSwatch" ADD CONSTRAINT "ColorSwatch_paletteId_fkey" FOREIGN KEY ("paletteId") REFERENCES "ColorPalette"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TypographySystem" ADD CONSTRAINT "TypographySystem_brandProjectId_fkey" FOREIGN KEY ("brandProjectId") REFERENCES "BrandProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TypographyStyle" ADD CONSTRAINT "TypographyStyle_typographySystemId_fkey" FOREIGN KEY ("typographySystemId") REFERENCES "TypographySystem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LogoConcept" ADD CONSTRAINT "LogoConcept_brandProjectId_fkey" FOREIGN KEY ("brandProjectId") REFERENCES "BrandProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LogoAsset" ADD CONSTRAINT "LogoAsset_logoConceptId_fkey" FOREIGN KEY ("logoConceptId") REFERENCES "LogoConcept"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LogoAsset" ADD CONSTRAINT "LogoAsset_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BrandSheet" ADD CONSTRAINT "BrandSheet_brandProjectId_fkey" FOREIGN KEY ("brandProjectId") REFERENCES "BrandProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BrandBook" ADD CONSTRAINT "BrandBook_brandProjectId_fkey" FOREIGN KEY ("brandProjectId") REFERENCES "BrandProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BrandBookSection" ADD CONSTRAINT "BrandBookSection_brandBookId_fkey" FOREIGN KEY ("brandBookId") REFERENCES "BrandBook"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShareLink" ADD CONSTRAINT "ShareLink_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShareLink" ADD CONSTRAINT "ShareLink_brandProjectId_fkey" FOREIGN KEY ("brandProjectId") REFERENCES "BrandProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_brandProjectId_fkey" FOREIGN KEY ("brandProjectId") REFERENCES "BrandProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommentReply" ADD CONSTRAINT "CommentReply_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "Comment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommentReply" ADD CONSTRAINT "CommentReply_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Approval" ADD CONSTRAINT "Approval_brandProjectId_fkey" FOREIGN KEY ("brandProjectId") REFERENCES "BrandProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Approval" ADD CONSTRAINT "Approval_approverId_fkey" FOREIGN KEY ("approverId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RevisionRequest" ADD CONSTRAINT "RevisionRequest_brandProjectId_fkey" FOREIGN KEY ("brandProjectId") REFERENCES "BrandProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RevisionRequest" ADD CONSTRAINT "RevisionRequest_requestedById_fkey" FOREIGN KEY ("requestedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Asset" ADD CONSTRAINT "Asset_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Asset" ADD CONSTRAINT "Asset_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Asset" ADD CONSTRAINT "Asset_brandProjectId_fkey" FOREIGN KEY ("brandProjectId") REFERENCES "BrandProject"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Export" ADD CONSTRAINT "Export_brandProjectId_fkey" FOREIGN KEY ("brandProjectId") REFERENCES "BrandProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Export" ADD CONSTRAINT "Export_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Export" ADD CONSTRAINT "Export_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Export" ADD CONSTRAINT "Export_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIProviderConfig" ADD CONSTRAINT "AIProviderConfig_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIJob" ADD CONSTRAINT "AIJob_brandProjectId_fkey" FOREIGN KEY ("brandProjectId") REFERENCES "BrandProject"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIJob" ADD CONSTRAINT "AIJob_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIJob" ADD CONSTRAINT "AIJob_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Generation" ADD CONSTRAINT "Generation_aiJobId_fkey" FOREIGN KEY ("aiJobId") REFERENCES "AIJob"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Generation" ADD CONSTRAINT "Generation_brandProjectId_fkey" FOREIGN KEY ("brandProjectId") REFERENCES "BrandProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GenerationVersion" ADD CONSTRAINT "GenerationVersion_editedBy_fkey" FOREIGN KEY ("editedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GenerationVersion" ADD CONSTRAINT "GenerationVersion_generationId_fkey" FOREIGN KEY ("generationId") REFERENCES "Generation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIUsage" ADD CONSTRAINT "AIUsage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIUsage" ADD CONSTRAINT "AIUsage_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIUsage" ADD CONSTRAINT "AIUsage_aiJobId_fkey" FOREIGN KEY ("aiJobId") REFERENCES "AIJob"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreditWallet" ADD CONSTRAINT "CreditWallet_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreditTransaction" ADD CONSTRAINT "CreditTransaction_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "CreditWallet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreditTransaction" ADD CONSTRAINT "CreditTransaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreditTransaction" ADD CONSTRAINT "CreditTransaction_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectActivity" ADD CONSTRAINT "ProjectActivity_brandProjectId_fkey" FOREIGN KEY ("brandProjectId") REFERENCES "BrandProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectActivity" ADD CONSTRAINT "ProjectActivity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AssetToComment" ADD CONSTRAINT "_AssetToComment_A_fkey" FOREIGN KEY ("A") REFERENCES "Asset"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AssetToComment" ADD CONSTRAINT "_AssetToComment_B_fkey" FOREIGN KEY ("B") REFERENCES "Comment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

