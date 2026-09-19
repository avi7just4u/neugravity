import { createAdminClient } from "@/lib/supabase/server"
import type { ContentRevision } from "@/types"

export const RevisionService = {
  async createRevision(data: {
    entity_type: string
    entity_id: string
    field_name?: string
    old_value: unknown
    new_value: unknown
    changed_by?: string
    change_reason?: string
  }): Promise<string> {
    const db = createAdminClient()

    const { data: latest } = await db
      .from("content_revisions")
      .select("version")
      .eq("content_type", data.entity_type)
      .eq("content_id", data.entity_id)
      .order("version", { ascending: false })
      .limit(1)
      .maybeSingle()

    const nextVersion = ((latest?.version ?? 0) as number) + 1

    const { data: row, error } = await db
      .from("content_revisions")
      .insert({
        content_type: data.entity_type,
        content_id: data.entity_id,
        version: nextVersion,
        snapshot: {
          field_name: data.field_name ?? null,
          old_value: data.old_value,
          new_value: data.new_value,
        },
        change_summary: data.change_reason ?? null,
        created_by: data.changed_by ?? null,
      })
      .select("id")
      .single()

    if (error || !row) throw new Error(`Failed to create revision: ${error?.message}`)
    return row.id as string
  },

  async getHistory(
    entity_type: string,
    entity_id: string,
    limit = 50
  ): Promise<ContentRevision[]> {
    const db = createAdminClient()
    const { data } = await db
      .from("content_revisions")
      .select("*")
      .eq("content_type", entity_type)
      .eq("content_id", entity_id)
      .order("version", { ascending: false })
      .limit(limit)
    return (data ?? []) as ContentRevision[]
  },

  async getRevision(revision_id: string): Promise<ContentRevision | null> {
    const db = createAdminClient()
    const { data } = await db
      .from("content_revisions")
      .select("*")
      .eq("id", revision_id)
      .maybeSingle()
    return data as ContentRevision | null
  },

  async rollback(
    revision_id: string,
    rolled_back_by?: string
  ): Promise<{ field_name: string | null; value: unknown }> {
    const revision = await this.getRevision(revision_id)
    if (!revision) throw new Error("Revision not found")

    const snapshot = revision.snapshot as {
      field_name: string | null
      old_value: unknown
      new_value: unknown
    }

    // Record the rollback as a new revision (old/new swapped)
    await this.createRevision({
      entity_type: revision.content_type,
      entity_id: revision.content_id,
      field_name: snapshot.field_name ?? undefined,
      old_value: snapshot.new_value,
      new_value: snapshot.old_value,
      changed_by: rolled_back_by,
      change_reason: `Rollback to version ${revision.version}`,
    })

    return { field_name: snapshot.field_name, value: snapshot.old_value }
  },
}
