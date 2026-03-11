-- Story 11.4: sketches ↔ knowledgeDocs bidirectional FK link
ALTER TABLE sketches ADD COLUMN knowledge_doc_id UUID REFERENCES knowledge_docs(id) ON DELETE SET NULL;
ALTER TABLE knowledge_docs ADD COLUMN linked_sketch_id UUID REFERENCES sketches(id) ON DELETE SET NULL;
CREATE INDEX idx_sketches_knowledge_doc ON sketches(knowledge_doc_id) WHERE knowledge_doc_id IS NOT NULL;
CREATE INDEX idx_knowledge_docs_sketch ON knowledge_docs(linked_sketch_id) WHERE linked_sketch_id IS NOT NULL;
