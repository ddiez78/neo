---
name: brainstorming
description: "You MUST use this before any creative work - creating features, building components, adding functionality, or modifying behavior. Explores user intent, requirements and design before implementation."
---

# Brainstorming Ideas Into Designs

Help turn ideas into fully formed designs and specs through natural collaborative dialogue.

Start by understanding the current project context, then ask questions one at a time to refine the idea. Once you understand what you are building, present the design and get user approval.

<HARD-GATE>
Do NOT invoke any implementation skill, write any code, scaffold any project, or take any implementation action until you have presented a design and the user has approved it. This applies to EVERY project regardless of perceived simplicity.
</HARD-GATE>

## Anti-Pattern: "This Is Too Simple To Need A Design"

Every project goes through this process. A todo list, a single-function utility, a config change - all of them. The design can be short (a few sentences for truly simple projects), but you MUST present it and get approval.

## Checklist

1. Explore project context - check files, docs, recent commits
2. Offer visual companion (if topic will involve visual questions)
3. Ask clarifying questions - one at a time
4. Propose 2-3 approaches - with trade-offs and your recommendation
5. Present design - in sections scaled to their complexity, get user approval after each section
6. Write design doc - save to docs/superpowers/specs/YYYY-MM-DD-<topic>-design.md and commit
7. Spec self-review - quick inline check for placeholders, contradictions, ambiguity, scope
8. User reviews written spec
9. Transition to implementation - invoke writing-plans skill

## Key Principles

- One question at a time - Do not overwhelm with multiple questions
- Multiple choice preferred - Easier to answer than open-ended when possible
- YAGNI ruthlessly - Remove unnecessary features from all designs
- Explore alternatives - Always propose 2-3 approaches before settling
- Incremental validation - Present design, get approval before moving on
- Be flexible - Go back and clarify when something does not make sense

## After the Design

Write the validated design (spec) to docs/superpowers/specs/YYYY-MM-DD-<topic>-design.md, commit it, then invoke the writing-plans skill to create a detailed implementation plan. Do NOT invoke any other skill. writing-plans is the next step.

## The Terminal State

The terminal state is invoking writing-plans. Do NOT invoke frontend-design, mcp-builder, or any other implementation skill. The ONLY skill you invoke after brainstorming is writing-plans.
