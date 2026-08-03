/**
 * GameUI — DOM chrome around the canvas
 *
 * @module game-client/ui/GameUI
 * @fileoverview HP/MP bars, spell hotbar with cooldown sweep, the legacy-color
 * message log, the Spell Book overlay (organized by school, every page carrying
 * its natural-language animation script), the partner choice dialog, and the
 * game-over veil. Pure presentation — every button press becomes a protocol
 * message via the callbacks handed to the constructor.
 */

import type { PartnerClass, QuestStage } from '@shared/protocol/messages';
import { NECROMANCER_SPELLS, PARTNER_SPELLS, spellById, type Spell } from '@shared/data/spellbook';

const QUEST_LABEL: Record<QuestStage, string> = {
  not_started: 'Speak with Elder Aldric by the well (E)',
  briefed: 'Descend the well (E at the well)',
  in_well: 'Clear the giant mutated rats!',
  rats_cleared: 'Return to Elder Aldric',
  partner_chosen: 'The road is open. (Well quest complete)',
};

export class GameUI {
  private onCast: (spellId: string) => void;
  private onChoose: (cls: PartnerClass) => void;
  private hotbar: Array<{ id: string; el: HTMLElement; sweep: HTMLElement }> = [];
  private cooldowns: Record<string, number> = {};
  private cdTimer: number;

  private $ = (id: string): HTMLElement => {
    const el = document.getElementById(id);
    if (!el) throw new Error(`GameUI: missing #${id}`);
    return el;
  };

  constructor(onCast: (spellId: string) => void, onChoose: (cls: PartnerClass) => void) {
    this.onCast = onCast;
    this.onChoose = onChoose;
    this.$('spellbook-close').addEventListener('click', () => this.toggleSpellbook());
    this.renderSpellbook();
    this.cdTimer = window.setInterval(() => this.paintCooldowns(), 100);
  }

  destroy(): void {
    window.clearInterval(this.cdTimer);
  }

  /* ------------------------------------------------------------- HUD */

  setStats(hp: number, maxHp: number, mp: number, maxMp: number, cds: Record<string, number>): void {
    const now = performance.now();
    for (const [id, remaining] of Object.entries(cds)) {
      this.cooldowns[id] = now + remaining;
    }
    const hpBar = this.$('hp-bar');
    const mpBar = this.$('mp-bar');
    hpBar.style.width = `${Math.max(0, (hp / maxHp) * 100)}%`;
    mpBar.style.width = `${Math.max(0, (mp / maxMp) * 100)}%`;
    this.$('hp-text').textContent = `HP ${hp}/${maxHp}`;
    this.$('mp-text').textContent = `MP ${mp}/${maxMp}`;
  }

  setSpells(spellIds: string[]): void {
    const bar = this.$('hotbar');
    bar.innerHTML = '';
    this.hotbar = [];
    spellIds.slice(0, 5).forEach((id, i) => {
      const spell = spellById(id);
      if (!spell) return;
      const btn = document.createElement('button');
      btn.className = 'hotkey';
      btn.title = `${spell.name} — ${spell.mechanics}`;
      btn.innerHTML =
        `<span class="hotkey-num">${i + 1}</span>` +
        `<span class="hotkey-name">${spell.name}</span>` +
        `<span class="hotkey-cost">${spell.manaCost} mp</span>` +
        `<span class="hotkey-sweep"></span>`;
      btn.addEventListener('click', () => this.onCast(id));
      bar.appendChild(btn);
      this.hotbar.push({ id, el: btn, sweep: btn.querySelector('.hotkey-sweep') as HTMLElement });
    });
  }

  private paintCooldowns(): void {
    const now = performance.now();
    for (const slot of this.hotbar) {
      const readyAt = this.cooldowns[slot.id] ?? 0;
      const spell = spellById(slot.id);
      const total = spell?.cooldownMs ?? 1;
      const remaining = Math.max(0, readyAt - now);
      slot.sweep.style.height = `${Math.min(100, (remaining / total) * 100)}%`;
      slot.el.classList.toggle('cooling', remaining > 0);
    }
  }

  setLocation(name: string): void {
    this.$('location').textContent = name;
  }

  setQuest(stage: QuestStage, note?: string): void {
    this.$('quest').textContent = `Quest: ${QUEST_LABEL[stage]}`;
    if (note) this.log('Quest', note, '#ffff55');
  }

  /* -------------------------------------------------------- message log */

  log(from: string, text: string, color: string): void {
    const logEl = this.$('log');
    const line = document.createElement('div');
    line.className = 'log-line';
    if (from) {
      const who = document.createElement('span');
      who.className = 'log-from';
      who.textContent = `${from}: `;
      line.appendChild(who);
    }
    const body = document.createElement('span');
    body.style.color = color;
    body.textContent = text;
    line.appendChild(body);
    logEl.appendChild(line);
    while (logEl.childElementCount > 80) logEl.firstElementChild?.remove();
    logEl.scrollTop = logEl.scrollHeight;
  }

  /* --------------------------------------------------------- spell book */

  toggleSpellbook(): void {
    this.$('spellbook').classList.toggle('open');
  }

  private renderSpellbook(): void {
    const body = this.$('spellbook-body');
    const sections: Array<{ title: string; spells: Spell[] }> = [
      { title: "The Necromancer's Grimoire", spells: NECROMANCER_SPELLS },
      { title: 'Partner Kit — Mage', spells: PARTNER_SPELLS.mage },
      { title: 'Partner Kit — Knight', spells: PARTNER_SPELLS.knight },
      { title: 'Partner Kit — Barbarian', spells: PARTNER_SPELLS.barbarian },
    ];

    for (const section of sections) {
      const h = document.createElement('h2');
      h.textContent = section.title;
      body.appendChild(h);

      const schools = [...new Set(section.spells.map((s) => s.school))];
      for (const school of schools) {
        const sh = document.createElement('h3');
        sh.textContent = school;
        body.appendChild(sh);

        for (const spell of section.spells.filter((s) => s.school === school)) {
          const card = document.createElement('div');
          card.className = `spell-card${spell.castable ? '' : ' locked'}`;
          card.innerHTML =
            `<div class="spell-head">` +
            `<span class="spell-name">${spell.name}</span>` +
            `<span class="spell-tier">Tier ${spell.tier}</span>` +
            `<span class="spell-inc">&ldquo;${spell.incantation}&rdquo;</span>` +
            `<span class="spell-cost">${spell.manaCost} mp &middot; ${(spell.cooldownMs / 1000).toFixed(1)}s</span>` +
            `</div>` +
            `<p class="spell-mech">${spell.mechanics}</p>` +
            `<p class="spell-anim"><b>Animation script:</b> ${spell.animationScript}</p>` +
            `<p class="spell-prov">${spell.provenance}</p>` +
            (spell.castable ? '' : '<p class="spell-lock">Page recovered — not yet attuned.</p>');
          body.appendChild(card);
        }
      }
    }
  }

  /* ------------------------------------------------------ modal dialogs */

  showPartnerChoice(): void {
    const dlg = this.$('partner-dialog');
    dlg.classList.add('open');
    dlg.querySelectorAll('button[data-cls]').forEach((btn) => {
      const b = btn as HTMLButtonElement;
      b.onclick = () => {
        dlg.classList.remove('open');
        this.onChoose(b.dataset.cls as PartnerClass);
      };
    });
  }

  showGameOver(): void {
    this.$('gameover').classList.add('open');
  }

  hideGameOver(): void {
    this.$('gameover').classList.remove('open');
  }
}
